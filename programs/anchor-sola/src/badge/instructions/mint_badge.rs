use crate::{
    badge::state::{BadgeGlobal, BadgeState, GenericOrigins, LineageOrigins},
    state::{CreatorsParam, SolaError},
    utils::create_non_transferable_mint,
    Dispatcher, IRegistryRef, TokenClass, TOKEN_SCHEMA_MAX_LEN,
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
#[instruction(class_id: u64,origins: Vec<u64>)]
pub struct MintBadge<'info> {
    #[account(
        mut,
        seeds = [
            "badge_global".as_bytes()
        ],
        bump,
    )]
    pub badge_global: Account<'info, BadgeGlobal>,
    /// CHECK:
    #[account(mut)]
    pub master_token: UncheckedAccount<'info>,
    /// CHECK:
    #[account(
        mut,
        seeds = [
            "mint_badge".as_bytes(),
            &badge_global.counter.to_be_bytes()[..],
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
        space = 8 + BadgeState::INIT_SPACE,
        seeds = [
            "badge_state".as_bytes(),
            master_mint.key().as_ref(),
        ],
        bump,
    )]
    pub badge_state: Account<'info, BadgeState>,

    #[account(
        init,
        payer = payer,
        space = 8 + LineageOrigins::init_space(origins.len()),
        seeds = [
            "lineage_origins".as_bytes(),
            master_mint.key().as_ref(),
        ],
        bump,
    )]
    pub lineage_origins: Option<Account<'info, LineageOrigins>>,

    #[account(
        init,
        payer = payer,
        space = 8 + GenericOrigins::INIT_SPACE,
        seeds = [
            "generic_origins".as_bytes(),
            master_mint.key().as_ref(),
        ],
        bump,
    )]
    pub generic_origins: Option<Account<'info, GenericOrigins>>,

    // register:
    #[account(
        seeds = [
            "token_class".as_bytes(),
            &class_id.to_be_bytes(),
        ],
        bump,
    )]
    pub token_class: Account<'info, TokenClass>,
    /// CHECK:
    #[account(
        seeds = [
            "mint_profile".as_bytes(),
            &token_class.controller.to_be_bytes(),
        ],
        bump,
    )]
    pub profile_mint: UncheckedAccount<'info>,
    /// CHECK:
    pub profile_token: UncheckedAccount<'info>,
    /// CHECK:
    #[account(
        seeds = [
            "dispatcher".as_bytes(),
            profile_mint.key().as_ref(),
        ],
        bump,
    )]
    pub dispatcher: UncheckedAccount<'info>,
    #[account(
        seeds = [
            "default_dispatcher".as_bytes(),
        ],
        bump,
    )]
    pub default_dispatcher: Account<'info, Dispatcher>,
    /// CHECK:
    #[account(
        seeds = [
            "class_generic".as_bytes(),
            token_class.key().as_ref(),
        ],
        bump,
    )]
    pub class_generic: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub publisher: Signer<'info>,
    // #[account(
    //     init_if_needed,
    //     payer = payer,
    //     space = 8 + BadgeState::INIT_SPACE,
    //     seeds = [
    //         "proxy_owner".as_bytes(),
    //         to.key().as_ref(),
    //     ],
    //     bump,
    // )]
    // pub proxy_owner: Account<'info, ProxyOwner>,
    /// CHECK: token owner
    pub to: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token2022>,
    pub spl_ata_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, Metadata>,
    /// CHECK:
    pub sysvar_instructions: UncheckedAccount<'info>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct MintBadgeParams {
    pub name: String,
    pub creators: Vec<CreatorsParam>,
    pub curator: Option<Pubkey>,
    pub seller_fee_basis_points: u16,
    pub symbol: String,
    pub uri: String,
    pub is_mutable: bool,
    pub weights: u64,
    pub schema: String,
}

pub fn mint_badge_handler(
    ctx: Context<MintBadge>,
    class_id: u64,
    params: MintBadgeParams,
    origins: Vec<u64>,
) -> Result<u64> {
    let accounts = ctx.accounts;

    require_gt!(TOKEN_SCHEMA_MAX_LEN, params.schema.len());

    require!(
        !(accounts.lineage_origins.is_some() && accounts.generic_origins.is_some()),
        SolaError::OriginsMismatch
    );

    let registry = IRegistryRef {
        token_class: &accounts.token_class,
        profile_mint: &accounts.profile_mint,
        profile_token: &accounts.profile_token,
        dispatcher: &accounts.dispatcher,
        default_dispatcher: &accounts.default_dispatcher,
        class_generic: &accounts.class_generic,
        spl_token_program: &accounts.token_program,
    };

    require!(!registry.get_token_class_fungible(), SolaError::NotSupport);

    if let Some(generic) = accounts.generic_origins.as_mut() {
        require!(registry.is_generic_badge_class(), SolaError::NoPermission);
        require_eq!(origins.len(), 1);
        generic.origin = origins[0];
    } else {
        require!(
            registry.is_token_class_owner(&accounts.publisher),
            SolaError::NoPermission
        );
    }

    if let Some(linege) = accounts.lineage_origins.as_mut() {
        require!(registry.is_lineage_badge_class(), SolaError::NoPermission);
        linege.origins = origins;
    }

    let badge_id = accounts.badge_global.counter;

    *accounts.badge_state = BadgeState {
        metatable: class_id,
        weights: params.weights,
        token_schema: params.schema.clone(),
        master_mint: accounts.master_mint.key(),
        master_metadata: accounts.master_metadata.key(),
        master_edition: accounts.master_edition.key(),
        badge_id: badge_id.to_be_bytes(),
        badge_bump: [ctx.bumps.badge_state],
        mint_bump: [ctx.bumps.master_mint],
    };

    if !registry.get_token_class_transferable() {
        create_non_transferable_mint(
            &accounts.master_mint,
            &accounts.master_metadata,
            &accounts.badge_state,
            &accounts.payer,
            mpl_token_metadata::types::TokenStandard::ProgrammableNonFungible,
            None,
            &accounts.token_program,
            &accounts.system_program,
            &accounts.badge_state.as_seeds(),
        )?;
    }

    if registry.get_token_class_revocable() {
        return Err(SolaError::NotSupport.into());
    }

    initialize(accounts, params)?;

    mint(accounts)?;

    accounts.badge_global.counter += 1;

    Ok(badge_id)
}

fn initialize(accounts: &mut MintBadge<'_>, params: MintBadgeParams) -> Result<()> {
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
    let badge_state = accounts.badge_state.to_account_info();
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
            authority: &badge_state,
            payer: &payer,
            // 在nft中，update authority 必须和authority 是同一个人
            update_authority: (&badge_state, true),
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
    let mint_seeds = accounts.badge_state.mint_seeds();
    let badge_seeds = accounts.badge_state.as_seeds();
    create_cpi.invoke_signed(&[&mint_seeds[..], &badge_seeds[..]])?;
    Ok(())
}

fn mint(accounts: &mut MintBadge<'_>) -> Result<()> {
    // Initialize
    let metadata_program = accounts.metadata_program.to_account_info();
    let master_metadata = accounts.master_metadata.to_account_info();
    let master_edition = accounts.master_edition.to_account_info();
    let master_mint = accounts.master_mint.to_account_info();
    let master_token = accounts.master_token.to_account_info();
    let token_record = accounts.token_record.to_account_info();
    let badge_state = accounts.badge_state.to_account_info();
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
            authority: &badge_state,
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

    let badge_seeds = accounts.badge_state.as_seeds();

    create_cpi.invoke_signed(&[&badge_seeds[..]])?;

    Ok(())
}
