use crate::state::SolaProperty;
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, *};

#[derive(Accounts)]
#[instruction(_name: String)]
pub struct MintSola<'info> {
    #[account(
        mut,
        seeds = [
            "mint".as_bytes(),
            publisher.key().as_ref(),
            _name.as_bytes(),
        ],
        bump,
        mint::authority = sola,
        mint::freeze_authority = sola,
    )]
    pub master_mint: InterfaceAccount<'info, Mint>,

    #[account(
        associated_token::authority = publisher,
        associated_token::mint = master_mint,
    )]
    pub master_token: InterfaceAccount<'info, TokenAccount>,

    #[account(
        has_one = master_mint,
    )]
    pub sola: Account<'info, SolaProperty>,

    pub publisher: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> MintSola<'info> {
    pub fn freeze_account_ctx(&self) -> CpiContext<'_, '_, '_, 'info, FreezeAccount<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = FreezeAccount {
            account: self.master_token.to_account_info(),
            authority: self.sola.to_account_info(),
            mint: self.master_mint.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn thaw_account_ctx(&self) -> CpiContext<'_, '_, '_, 'info, ThawAccount<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = ThawAccount {
            account: self.master_token.to_account_info(),
            authority: self.sola.to_account_info(),
            mint: self.master_mint.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = MintTo {
            mint: self.master_mint.to_account_info(),
            to: self.master_token.to_account_info(),
            authority: self.sola.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

pub fn mint_sola_handler(ctx: Context<MintSola>, _name: String, amount: u64) -> Result<()> {
    require_gt!(amount, 0);

    token_interface::thaw_account(
        ctx.accounts
            .thaw_account_ctx()
            .with_signer(&[&ctx.accounts.sola.as_seeds()]),
    )?;

    // Mint the master token.
    token_interface::mint_to(
        ctx.accounts
            .mint_to_ctx()
            .with_signer(&[&ctx.accounts.sola.as_seeds()]),
        amount,
    )?;

    // Freeze the token account after minting.
    token_interface::freeze_account(
        ctx.accounts
            .freeze_account_ctx()
            .with_signer(&[&ctx.accounts.sola.as_seeds()]),
    )?;

    Ok(())
}
