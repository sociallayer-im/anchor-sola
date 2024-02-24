use crate::{Dispatcher, SolaProfileGlobal};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetDefaultDispatcher<'info> {
    #[account(
        mut,
        seeds = [
            "sola_profile_global".as_bytes()
        ],
        bump,
        has_one = owner,
    )]
    pub sola_profile_global: Account<'info, SolaProfileGlobal>,
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + Dispatcher::INIT_SPACE,
        seeds = [
            "default_dispatcher".as_bytes()
        ],
        bump,
    )]
    pub default_dispatcher: Account<'info, Dispatcher>,
    /// CHECK:
    #[account(mut)]
    pub payer: Signer<'info>,
    pub owner: Signer<'info>,
    /// CHECK:
    pub dispatcher: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handle_set_default_dispatcher(ctx: Context<SetDefaultDispatcher>) -> Result<()> {
    ctx.accounts.default_dispatcher.dispatcher = ctx.accounts.dispatcher.key();

    Ok(())
}
