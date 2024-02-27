use crate::{
    profile::utils::{is_dispatcher, is_owner},
    state::SolaError,
    Dispatcher, GroupController,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(controller_id: u64)]
pub struct SetGroupController<'info> {
    /// CHECK:
    #[account(
        mut,
        seeds = [
            "mint".as_bytes(),
            &controller_id.to_be_bytes()[..],
        ],
        bump
    )]
    pub master_mint: UncheckedAccount<'info>,
    /// CHECK:
    pub master_token: Option<UncheckedAccount<'info>>,
    /// CHECK:
    #[account(
        seeds = [
            "dispatcher".as_bytes(),
            master_mint.key().as_ref(),
        ],
        bump,
    )]
    pub dispatcher: UncheckedAccount<'info>,
    #[account(
        seeds = [
            "default_dispatcher".as_bytes()
        ],
        bump,
    )]
    pub default_dispatcher: Account<'info, Dispatcher>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + GroupController::INIT_SPACE,
        seeds = [
            "group_controller".as_bytes(),
            master_mint.key().as_ref(),
            controller.key().as_ref(),
        ],
        bump,
    )]
    pub group_controller: Account<'info, GroupController>,
    /// CHECK:
    #[account(mut)]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,
    /// CHECK:
    pub controller: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct SetGroupControllerParams {
    pub is_manager: bool,
    pub is_issuer: bool,
    pub is_member: bool,
}

pub fn handle_set_group_controller(
    ctx: Context<SetGroupController>,
    _controller_id: u64,
    params: SetGroupControllerParams,
) -> Result<()> {
    let authority = ctx.accounts.authority.key();

    require!(
        is_owner(
            ctx.accounts.master_token.as_ref(),
            authority,
            ctx.accounts.master_mint.as_ref()
        ) || is_dispatcher(
            &ctx.accounts.dispatcher,
            &ctx.accounts.default_dispatcher,
            authority
        ),
        SolaError::NoPermission
    );

    *ctx.accounts.group_controller = GroupController {
        is_manager: params.is_manager,
        is_issuer: params.is_issuer,
        is_member: params.is_member,
    };

    Ok(())
}
