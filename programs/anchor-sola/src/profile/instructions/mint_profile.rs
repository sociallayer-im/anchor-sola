use crate::{
    profile::state::SolaProfile,
    state::{CreatorsParam, SolaError},
    DefaultProfileId, IsProfileCreator, SolaProfileGlobal,
};
use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, metadata::Metadata, token_interface::*};
use mpl_token_metadata::{
    instructions::{
        CreateCpi, CreateCpiAccounts, CreateInstructionArgs, MintCpi, MintCpiAccounts,
        MintInstructionArgs,
    },
    types::{CreateArgs, Creator, MintArgs},
};

#[derive(Accounts)]
#[instruction(profile_id: Option<u64>)]
pub struct MintProfile<'info> {
    #[account(
        mut,
        seeds = [
            "sola_profile_global".as_bytes()
        ],
        bump,
    )]
    pub sola_profile_global: Account<'info, SolaProfileGlobal>,
    #[account(
        seeds = [
            "sola_profile_creator".as_bytes(),
            sola_profile_global.key().as_ref(),
            publisher.key().as_ref()
        ],
        bump,
    )]
    pub sola_creator: Account<'info, IsProfileCreator>,
    #[account(
        init,
        space = 8 + DefaultProfileId::INIT_SPACE,
        payer = payer,
        seeds = [
            "sola_default_profiles".as_bytes(),
            sola_profile_global.key().as_ref(),
            to.key().as_ref()
        ],
        bump,
    )]
    pub address_default_profiles: Option<Account<'info, DefaultProfileId>>,
    /// CHECK:
    #[account(mut)]
    pub master_token: UncheckedAccount<'info>,
    /// CHECK:
    #[account(
        mut,
        seeds = [
            "mint".as_bytes(),
            &profile_id.unwrap_or(sola_profile_global.counter).to_be_bytes()[..],
        ],
        bump
    )]
    pub master_mint: UncheckedAccount<'info>,

    /// CHECK: Account allocation and initialization is done via CPI to the metadata program.
    #[account(
        mut,
        seeds = [
            "metadata".as_bytes(),
            metadata_program.key().as_ref(),
            master_mint.key().as_ref(),
        ],
        seeds::program = metadata_program.key(),
        bump,
    )]
    pub master_metadata: UncheckedAccount<'info>,

    /// CHECK:
    #[account(
        mut,
        seeds = [
            "metadata".as_bytes(),
            metadata_program.key().as_ref(),
            master_mint.key().as_ref(),
            "edition".as_bytes(),
        ],
        seeds::program = metadata_program.key(),
        bump
    )]
    pub master_edition: UncheckedAccount<'info>,
    /// CHECK:
    #[account(
        mut,
        seeds = [
            "metadata".as_bytes(),
            metadata_program.key().as_ref(),
            master_mint.key().as_ref(),
            "token_record".as_bytes(),
            master_token.key().as_ref(),
        ],
        seeds::program = metadata_program.key(),
        bump)]
    pub token_record: UncheckedAccount<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + SolaProfile::INIT_SPACE,
        seeds = [
            "sola_profile".as_bytes(),
            master_mint.key().as_ref(),
        ],
        bump,
    )]
    pub sola_profile: Account<'info, SolaProfile>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub publisher: Signer<'info>,
    /// CHECK: token owner
    pub to: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub spl_ata_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, Metadata>,
    /// CHECK:
    pub sysvar_instructions: UncheckedAccount<'info>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct MintProfileParams {
    pub name: String,
    pub creators: Vec<CreatorsParam>,
    pub curator: Option<Pubkey>,
    pub seller_fee_basis_points: u16,
    pub symbol: String,
    pub uri: String,
    pub is_mutable: bool,
}

pub fn mint_profile_handler(
    ctx: Context<MintProfile>,
    profile_id: Option<u64>,
    params: MintProfileParams,
) -> Result<u64> {
    let accounts = ctx.accounts;

    if let Some(default_profile) = accounts.address_default_profiles.as_deref_mut() {
        require!(profile_id.is_none(), SolaError::ProfileIdNotNull);

        default_profile.profile_id = accounts.sola_profile_global.counter;
    }

    let profile_id = profile_id.unwrap_or(accounts.sola_profile_global.counter);

    msg!(
        "befor mint counter:{:?}",
        accounts.sola_profile_global.counter
    );

    require!(
        accounts.sola_creator.is_profile_creator,
        SolaError::NotProfileCreator
    );

    initialize(
        accounts,
        ctx.bumps.sola_profile,
        ctx.bumps.master_mint,
        profile_id,
        params,
    )?;

    mint(accounts)?;

    accounts.sola_profile_global.counter += 1;

    msg!(
        "after mint counter:{:?}",
        accounts.sola_profile_global.counter
    );
    Ok(profile_id)
}

fn initialize(
    accounts: &mut MintProfile<'_>,
    profile_bump: u8,
    mint_bump: u8,
    profile_id: u64,
    params: MintProfileParams,
) -> Result<()> {
    let profile = &mut accounts.sola_profile;
    **profile = SolaProfile {
        owner: accounts.to.key(),
        master_metadata: accounts.master_metadata.key(),
        master_mint: accounts.master_mint.key(),
        master_edition: accounts.master_edition.key(),
        profile_bump: [profile_bump],
        mint_bump: [mint_bump],
        address_default_profiles: accounts
            .address_default_profiles
            .as_ref()
            .map(|addr| addr.key()),
        profile_id: profile_id.to_be_bytes(),
    };
    let creators = Some(
        params
            .creators
            .iter()
            .map(|c| Creator {
                address: c.address,
                share: c.share,
                verified: false,
            })
            .collect::<Vec<_>>(),
    );
    let metadata_program = accounts.metadata_program.to_account_info();
    let master_metadata = accounts.master_metadata.to_account_info();
    let master_edition = accounts.master_edition.to_account_info();
    let master_mint = accounts.master_mint.to_account_info();
    let sola_profile = profile.to_account_info();
    let payer = accounts.payer.to_account_info();
    let instructions = accounts.sysvar_instructions.to_account_info();
    let system = accounts.system_program.to_account_info();
    let spl = accounts.token_program.to_account_info();
    let create_cpi = CreateCpi::new(
        &metadata_program,
        CreateCpiAccounts {
            metadata: &master_metadata,
            master_edition: Some(&master_edition),
            mint: (&master_mint, true),
            // 这个账户允许mint
            // 在这里我们设置为profile拥有权限，后续我们自定义自己的mint方法，由该程序去间接调用mpl 的 mint接口
            authority: &sola_profile,
            payer: &payer,
            // 在nft中，update authority 必须和authority 是同一个人
            update_authority: (&sola_profile, true),
            system_program: &system,
            sysvar_instructions: &instructions,
            spl_token_program: Some(&spl),
        },
        CreateInstructionArgs {
            create_args: CreateArgs::V1 {
                name: params.name,
                symbol: params.symbol,
                uri: params.uri,
                seller_fee_basis_points: params.seller_fee_basis_points,
                is_mutable: params.is_mutable,
                primary_sale_happened: false,
                collection_details: None,
                uses: None,
                creators,
                token_standard: mpl_token_metadata::types::TokenStandard::ProgrammableNonFungible,
                collection: None,
                // 用来控制权限的，但具体不知道怎么控制，后续测试再考虑
                rule_set: None,
                decimals: None,
                // 控制print的最大次数，为零则不可以调用print（print有刷新的意思，就是相当于mint一个新的edition）
                print_supply: Some(mpl_token_metadata::types::PrintSupply::Zero),
            },
        },
    );
    let mint_info_seeds = profile.mint_seeds();
    let sola_profile_seeds = profile.as_seeds();
    create_cpi.invoke_signed(&[&mint_info_seeds[..], &sola_profile_seeds[..]])?;
    Ok(())
}

fn mint(accounts: &mut MintProfile<'_>) -> Result<()> {
    // Initialize
    let metadata_program = accounts.metadata_program.to_account_info();
    let master_metadata = accounts.master_metadata.to_account_info();
    let master_edition = accounts.master_edition.to_account_info();
    let master_mint = accounts.master_mint.to_account_info();
    let master_token = accounts.master_token.to_account_info();
    let token_record = accounts.token_record.to_account_info();
    let sola_profile = accounts.sola_profile.to_account_info();
    let payer = accounts.payer.to_account_info();
    let to = accounts.to.to_account_info();
    let instructions = accounts.sysvar_instructions.to_account_info();
    let system = accounts.system_program.to_account_info();
    let spl = accounts.token_program.to_account_info();
    let ata = accounts.spl_ata_program.to_account_info();
    let create_cpi = MintCpi::new(
        &metadata_program,
        MintCpiAccounts {
            metadata: &master_metadata,
            master_edition: Some(&master_edition),
            mint: &master_mint,
            // 这个账户允许mint
            // 在这里我们设置为profile拥有权限，后续我们自定义自己的mint方法，由该程序去间接调用mpl 的 mint接口
            authority: &sola_profile,
            payer: &payer,
            // 在nft中，update authority 必须和authority 是同一个人
            system_program: &system,
            sysvar_instructions: &instructions,
            spl_token_program: &spl,
            token: &master_token,
            token_owner: Some(&to),
            token_record: Some(&token_record),
            delegate_record: None,
            spl_ata_program: &ata,
            authorization_rules_program: None,
            authorization_rules: None,
        },
        MintInstructionArgs {
            mint_args: MintArgs::V1 {
                // pNFT 所以是1
                amount: 1,
                // TODO:
                authorization_data: None,
            },
        },
    );

    let sola_profile_seeds = accounts.sola_profile.as_seeds();

    create_cpi.invoke_signed(&[&sola_profile_seeds[..]])?;

    Ok(())
}
