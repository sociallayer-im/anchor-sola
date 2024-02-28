use crate::{
    profile::utils::{is_dispatcher, is_owner},
    state::SolaError,
    Dispatcher, TokenClass, TokenClassState,
};
use anchor_lang::prelude::*;
use anchor_spl::token_2022::Token2022;

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
        space = 8 + TokenClassState::INIT_SPACE,
        seeds = [
            "token_class_state".as_bytes(),
            token_class.key().as_ref(),
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
    pub token_program: Program<'info, Token2022>,
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
    require!(
        is_owner(
            ctx.accounts.master_token.as_ref(),
            &ctx.accounts.authority,
            ctx.accounts.master_mint.as_ref(),
            &ctx.accounts.token_program,
        ) || is_dispatcher(
            &ctx.accounts.dispatcher,
            &ctx.accounts.default_dispatcher,
            &ctx.accounts.authority
        ),
        SolaError::NoPermission
    );

    *ctx.accounts.token_class_state = TokenClassState {
        is_issuer: params.is_issuer,
        is_consumer: params.is_consumer,
    };

    Ok(())
}
