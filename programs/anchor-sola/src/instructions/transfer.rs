use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        self, CloseAccount, FreezeAccount, Mint, ThawAccount, TokenAccount, TokenInterface,
        TransferChecked,
    },
};

use crate::state::SolaProperty;

#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(
        has_one = master_mint,
    )]
    pub sola: Account<'info, SolaProperty>,

    #[account(
        mut,
        associated_token::mint = master_mint,
        associated_token::authority = authority,
        constraint = source.amount >= 1,
    )]
    pub source: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = master_mint,
        associated_token::authority = recipient,
    )]
    pub destination: InterfaceAccount<'info, TokenAccount>,

    /// CHECK: validated with `has_one` on the xNFT account
    pub master_mint: InterfaceAccount<'info, Mint>,

    pub recipient: SystemAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> Transfer<'info> {
    pub fn close_account_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = CloseAccount {
            account: self.source.to_account_info(),
            authority: self.authority.to_account_info(),
            destination: self.authority.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn freeze_account_ctx(
        &self,
        account: AccountInfo<'info>,
    ) -> CpiContext<'_, '_, '_, 'info, FreezeAccount<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = FreezeAccount {
            account,
            authority: self.sola.to_account_info(),
            mint: self.master_mint.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn thaw_account_ctx(
        &self,
        account: AccountInfo<'info>,
    ) -> CpiContext<'_, '_, '_, 'info, ThawAccount<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = ThawAccount {
            account,
            authority: self.sola.to_account_info(),
            mint: self.master_mint.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, TransferChecked<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = TransferChecked {
            authority: self.authority.to_account_info(),
            mint: self.master_mint.to_account_info(),
            from: self.source.to_account_info(),
            to: self.destination.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

pub fn transfer_handler(ctx: Context<Transfer>) -> Result<()> {
    let sola = &ctx.accounts.sola;

    // Unfreeze the token account if it is frozen.
    token_interface::thaw_account(
        ctx.accounts
            .thaw_account_ctx(ctx.accounts.source.to_account_info())
            .with_signer(&[&sola.as_seeds()]),
    )?;

    // Transfer the token in the source account to the recipient's destination token account.
    token_interface::transfer_checked(
        ctx.accounts.transfer_ctx(),
        ctx.accounts.source.amount,
        ctx.accounts.master_mint.decimals,
    )?;

    // Freeze the new account if necessary.
    token_interface::freeze_account(
        ctx.accounts
            .freeze_account_ctx(ctx.accounts.destination.to_account_info())
            .with_signer(&[&sola.as_seeds()]),
    )?;

    if ctx.accounts.source.amount == 0 && ctx.accounts.source.delegated_amount == 0 {
        token_interface::close_account(ctx.accounts.close_account_ctx())?;
    } else {
        token_interface::freeze_account(
            ctx.accounts
                .freeze_account_ctx(ctx.accounts.source.to_account_info())
                .with_signer(&[&sola.as_seeds()]),
        )?;
    }

    Ok(())
}
