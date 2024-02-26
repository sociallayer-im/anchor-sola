use crate::{Dispatcher, SolaProfile};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(controller_id: u64)]
pub struct SetDispatcher<'info> {
    /// CHECK:
    #[account(
        mut,
        seeds = [
            "mint_profile".as_bytes(),
            &controller_id.to_be_bytes()[..],
        ],
        bump
    )]
    pub master_mint: UncheckedAccount<'info>,
    #[account(
        seeds = [
            "sola_profile".as_bytes(),
            master_mint.key().as_ref(),
        ],
        bump,
        has_one = master_mint,
        has_one = owner,
    )]
    pub sola_profile: Account<'info, SolaProfile>,
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + Dispatcher::INIT_SPACE,
        seeds = [
            "dispatcher".as_bytes(),
            &controller_id.to_be_bytes(),
        ],
        bump,
    )]
    pub dispatcher: Account<'info, Dispatcher>,
    /// CHECK:
    #[account(mut)]
    pub payer: Signer<'info>,
    pub owner: Signer<'info>,
    /// CHECK:
    pub user_dispatcher: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handle_set_dispatcher(ctx: Context<SetDispatcher>, _controller_id: u64) -> Result<()> {
    ctx.accounts.dispatcher.dispatcher = ctx.accounts.user_dispatcher.key();

    Ok(())
}
