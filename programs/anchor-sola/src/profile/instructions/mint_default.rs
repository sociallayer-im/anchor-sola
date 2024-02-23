use crate::{
    profile::state::SolaProfile, DefaultProfileId, IsProfileCreator, MintProfile,
    MintProfileParams, SolaProfileGlobal, _mint,
};
use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, metadata::Metadata, token_interface::*};

#[derive(Accounts)]
pub struct MintDefaultProfile<'info> {
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
            publisher.key().as_ref()
        ],
        bump,
    )]
    pub address_default_profiles: Account<'info, DefaultProfileId>,
    /// CHECK:
    #[account(mut)]
    pub master_token: UncheckedAccount<'info>,
    /// CHECK:
    #[account(
        mut,
        seeds = [
            "mint".as_bytes(),
            &sola_profile_global.counter.to_be_bytes()[..],
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

pub fn mint_default_profile_handler(
    ctx: Context<MintDefaultProfile>,
    params: MintProfileParams,
) -> Result<()> {
    let accounts = ctx.accounts;

    let profile_id = accounts.sola_profile_global.counter;
    accounts.address_default_profiles.profile_id = profile_id;

    let mut mint_accounts = MintProfile {
        sola_profile_global: accounts.sola_profile_global.clone(),
        sola_creator: accounts.sola_creator.clone(),
        master_token: accounts.master_token.clone(),
        master_mint: accounts.master_mint.clone(),
        master_metadata: accounts.master_metadata.clone(),
        master_edition: accounts.master_edition.clone(),
        token_record: accounts.token_record.clone(),
        sola_profile: accounts.sola_profile.clone(),
        payer: accounts.payer.clone(),
        publisher: accounts.publisher.clone(),
        to: accounts.to.clone(),
        system_program: accounts.system_program.clone(),
        token_program: accounts.token_program.clone(),
        spl_ata_program: accounts.spl_ata_program.clone(),
        metadata_program: accounts.metadata_program.clone(),
        sysvar_instructions: accounts.sysvar_instructions.clone(),
        rent: accounts.rent.clone(),
    };

    _mint(
        &mut mint_accounts,
        ctx.bumps.sola_profile,
        ctx.bumps.master_mint,
        profile_id,
        params,
    )?;

    Ok(())
}
