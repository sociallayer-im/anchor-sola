use crate::{IsProfileCreator, SolaProfileGlobal};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetProfileCreator<'info> {
    #[account(
        seeds = [
            "sola_profile_global".as_bytes()
        ],
        bump,
        has_one = owner
    )]
    pub sola_profile_global: Box<Account<'info, SolaProfileGlobal>>,
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + IsProfileCreator::INIT_SPACE,
        seeds = [
            "sola_profile_creator".as_bytes(),
            sola_profile_global.key().as_ref(),
            creator.key().as_ref()
        ],
        bump,
    )]
    pub sola_creator: Account<'info, IsProfileCreator>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub owner: Signer<'info>,
    /// CHECK:
    pub creator: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handle_set_profile_creator(ctx: Context<SetProfileCreator>, status: bool) -> Result<()> {
    ctx.accounts.sola_creator.is_profile_creator = status;

    Ok(())
}
