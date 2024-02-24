use crate::{state::SolaError, Dispatcher, SolaProfile, TokenClass, TokenClassState};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(class_id: u64)]
pub struct SetTokenClassState<'info> {
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
        mut,
        seeds = [
            "mint".as_bytes(),
            &token_class.controller.to_be_bytes()[..],
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
            &token_class.controller.to_be_bytes(),
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
        space = 8 + TokenClassState::INIT_SPACE,
        seeds = [
            "token_class_state".as_bytes(),
            &class_id.to_be_bytes(),
            controller.key().as_ref(),
        ],
        bump,
    )]
    pub token_class_state: Account<'info, TokenClassState>,
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
pub struct SetTokenClassStateParams {
    pub is_issuer: bool,
    pub is_consumer: bool,
}

pub fn handle_set_token_class_state(
    ctx: Context<SetTokenClassState>,
    _class_id: u64,
    params: SetTokenClassStateParams,
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

    *ctx.accounts.token_class_state = TokenClassState {
        is_issuer: params.is_issuer,
        is_consumer: params.is_consumer,
    };

    Ok(())
}
