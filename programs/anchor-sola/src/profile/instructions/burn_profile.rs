use crate::{profile::state::SolaProfile, state::SolaError, DefaultProfileId};
use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, metadata::Metadata, token_interface::*};
use mpl_token_metadata::instructions::BurnInstructionArgs;

#[derive(Accounts)]
#[instruction(profile_id: u64)]
pub struct BurnProfile<'info> {
    #[account(
        mut,
        seeds = [
            "sola_default_profiles".as_bytes(),
            owner.key().as_ref()
        ],
        bump,
        close = close,
    )]
    pub address_default_profiles: Option<Account<'info, DefaultProfileId>>,
    /// CHECK:
    #[account(mut)]
    pub master_token: UncheckedAccount<'info>,
    /// CHECK:
    #[account(
        mut,
        seeds = [
            "mint_profile".as_bytes(),
            &profile_id.to_be_bytes()[..],
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
        bump
    )]
    pub token_record: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [
            "sola_profile".as_bytes(),
            master_mint.key().as_ref(),
        ],
        bump,
        has_one = master_mint,
        has_one = master_metadata,
        has_one = master_edition,
        close = close,
    )]
    pub sola_profile: Account<'info, SolaProfile>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK:
    pub close: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub spl_ata_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, Metadata>,
    /// CHECK:
    pub sysvar_instructions: UncheckedAccount<'info>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn burn_profile_handler(ctx: Context<BurnProfile>, _profile_id: u64) -> Result<()> {
    let accounts = ctx.accounts;

    if let Some(real) = accounts.sola_profile.address_default_profiles {
        let Some(give) = accounts.address_default_profiles.as_ref() else {
            return Err(SolaError::NotFoundDefaultProfiles.into());
        };
        require_keys_eq!(real, give.key());
    }
    let edition = accounts.master_edition.to_account_info();
    let token_record = accounts.token_record.to_account_info();

    let burn_accounts = mpl_token_metadata::instructions::BurnCpiAccounts {
        authority: &accounts.owner.to_account_info(),
        collection_metadata: None,
        metadata: &accounts.master_metadata.to_account_info(),
        edition: Some(&edition),
        mint: &accounts.master_mint.to_account_info(),
        token: &accounts.master_token.to_account_info(),
        master_edition: None,
        master_edition_mint: None,
        master_edition_token: None,
        edition_marker: None,
        token_record: Some(&token_record),
        system_program: &accounts.system_program.to_account_info(),
        sysvar_instructions: &accounts.sysvar_instructions.to_account_info(),
        spl_token_program: &accounts.token_program.to_account_info(),
    };

    mpl_token_metadata::instructions::BurnCpi::new(
        &accounts.metadata_program.to_account_info(),
        burn_accounts,
        BurnInstructionArgs {
            burn_args: mpl_token_metadata::types::BurnArgs::V1 { amount: 1 },
        },
    )
    .invoke()?;

    Ok(())
}
