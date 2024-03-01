use crate::{state::SolaError, utils::is_owner, Dispatcher};
use anchor_lang::prelude::*;
use anchor_spl::token_2022::Token2022;

#[derive(Accounts)]
#[instruction(controller_id: u64)]
pub struct SetDispatcher<'info> {
    /// CHECK:
    #[account(
        mut,
        seeds = [
            "mint_profile".as_bytes(),
            &controller_id.to_be_bytes(),
        ],
        bump
    )]
    pub master_mint: UncheckedAccount<'info>,
    /// CHECK:
    pub master_token: UncheckedAccount<'info>,
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + Dispatcher::INIT_SPACE,
        seeds = [
            "dispatcher".as_bytes(),
            master_mint.key().as_ref(),
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
    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handle_set_dispatcher(ctx: Context<SetDispatcher>, _controller_id: u64) -> Result<()> {
    require!(
        is_owner(
            &ctx.accounts.master_token,
            &ctx.accounts.owner,
            ctx.accounts.master_mint.as_ref(),
            &ctx.accounts.token_program
        ),
        SolaError::NoPermission
    );
    ctx.accounts.dispatcher.dispatcher = ctx.accounts.user_dispatcher.key();

    Ok(())
}
