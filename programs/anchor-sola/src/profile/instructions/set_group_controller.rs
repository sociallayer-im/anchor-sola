use crate::{state::SolaError, Dispatcher, GroupController, SolaProfile};
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
    #[account(
        seeds = [
            "sola_profile".as_bytes(),
            master_mint.key().as_ref(),
        ],
        bump,
        has_one = master_mint,
    )]
    pub sola_profile: Account<'info, SolaProfile>,
    /// CHECK:
    #[account(
        seeds = [
            "dispatcher".as_bytes(),
            &controller_id.to_be_bytes(),
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
            &controller_id.to_be_bytes(),
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
    // require(ownerOf(controllerId) == addr ||
    // isDispatcher(controllerId, addr), "no permission");
    let allowed = ctx.accounts.sola_profile.owner == authority
        || (ctx.accounts.dispatcher.data_is_empty()
            && ctx.accounts.default_dispatcher.dispatcher == authority)
        || (ctx
            .accounts
            .dispatcher
            .try_borrow_data()
            .ok()
            .as_ref()
            .and_then(|data| Dispatcher::try_deserialize(&mut &data[..]).ok())
            .filter(|dispatcher| authority == dispatcher.dispatcher)
            .is_some());

    require!(allowed, SolaError::NoPermission);

    *ctx.accounts.group_controller = GroupController {
        is_manager: params.is_manager,
        is_issuer: params.is_issuer,
        is_member: params.is_member,
    };

    Ok(())
}
