use crate::state::{CreateSolaParams, SolaError, SolaProperty};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        self,
        mpl_token_metadata::{
            types::{Creator, DataV2},
            MAX_URI_LENGTH,
        },
        CreateMetadataAccountsV3, Metadata, SignMetadata, UpdatePrimarySaleHappenedViaToken,
    },
    token_interface::{self, *},
};

#[derive(Accounts)]
#[instruction(name: String,_decimals: u8)]
pub struct CreateSola<'info> {
    #[account(
        init,
        payer = payer,
        seeds = [
            "mint".as_bytes(),
            publisher.key().as_ref(),
            name.as_bytes(),
        ],
        bump,
        mint::authority = sola,
        mint::freeze_authority = sola,
        mint::decimals = _decimals,
    )]
    pub master_mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = payer,
        associated_token::authority = publisher,
        associated_token::mint = master_mint,
    )]
    pub master_token: InterfaceAccount<'info, TokenAccount>,

    /// CHECK: Account allocation and initialization is done via CPI to the metadata program.
    #[account(
        mut,
        seeds = [
            "metadata".as_bytes(),
            metadata_program.key().as_ref(),
            master_mint.key().as_ref(),
        ],
        seeds::program = metadata_program.key(),
        bump,
    )]
    pub master_metadata: UncheckedAccount<'info>,

    #[account(
        init,
        payer = payer,
        space = SolaProperty::LEN,
        seeds = [
            "sola".as_bytes(),
            master_mint.key().as_ref(),
        ],
        bump,
    )]
    pub sola: Box<Account<'info, SolaProperty>>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub publisher: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> CreateSola<'info> {
    pub fn create_metadata_accounts_ctx(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, CreateMetadataAccountsV3<'info>> {
        let program = self.metadata_program.to_account_info();
        let accounts = CreateMetadataAccountsV3 {
            metadata: self.master_metadata.to_account_info(),
            mint: self.master_mint.to_account_info(),
            mint_authority: self.sola.to_account_info(),
            payer: self.payer.to_account_info(),
            update_authority: self.sola.to_account_info(),
            system_program: self.system_program.to_account_info(),
            rent: self.rent.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn freeze_account_ctx(&self) -> CpiContext<'_, '_, '_, 'info, FreezeAccount<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = FreezeAccount {
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

    pub fn sign_metadata_ctx(&self) -> CpiContext<'_, '_, '_, 'info, SignMetadata<'info>> {
        let program = self.metadata_program.to_account_info();
        let accounts = SignMetadata {
            creator: self.publisher.to_account_info(),
            metadata: self.master_metadata.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn update_primary_sale_happened_ctx(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, UpdatePrimarySaleHappenedViaToken<'info>> {
        let program = self.metadata_program.to_account_info();
        let accounts = UpdatePrimarySaleHappenedViaToken {
            metadata: self.master_metadata.to_account_info(),
            owner: self.publisher.to_account_info(),
            token: self.master_token.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

pub fn create_sola_handler(
    ctx: Context<CreateSola>,
    name: String,
    _decimals: u8,
    amount: u64,
    params: CreateSolaParams,
) -> Result<()> {
    // Check the length of the metadata uri provided.
    //
    // The argued name does not need to be validated since the maximum
    // length is the same as the max seed length, meaning the instruction
    // will already fail if the name exceeds that.
    require!(
        params.uri.len() <= MAX_URI_LENGTH,
        SolaError::UriExceedsMaxLength,
    );

    // Initialize and populate the new SOLA program account data.
    let sola = &mut ctx.accounts.sola;
    ***sola = SolaProperty {
        publisher: ctx.accounts.publisher.key(),
        master_metadata: ctx.accounts.master_metadata.key(),
        master_mint: ctx.accounts.master_mint.key(),
        is_burnable: params.is_burnable,
        name: name.clone(),
        bump: [ctx.bumps.sola],
    };

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

    // Validation that share percentage splits sums up to 100 is
    // done by MPL in the `create_metadata_accounts_v3` CPI call
    // and verification that the publisher is among the list of creators
    // is done via the `sign_metadata` CPI call to verify the pubkey.
    let creators = Some(
        params
            .creators
            .iter()
            .map(|c| Creator {
                address: c.address,
                share: c.share,
                verified: false,
            })
            .collect(),
    );

    metadata::create_metadata_accounts_v3(
        ctx.accounts
            .create_metadata_accounts_ctx()
            .with_signer(&[&ctx.accounts.sola.as_seeds()]),
        DataV2 {
            name,
            symbol: params.symbol,
            uri: params.uri,
            seller_fee_basis_points: params.seller_fee_basis_points,
            creators,
            collection: None,
            uses: None,
        },
        params.is_mutable,
        params.update_authority_is_signer,
        None,
    )?;

    // Verify the publisher in the list of creators on the metadata.
    // The remainder of the creators in the list must invoke MPL
    // `sign_metadata` on their own so that they are the signers of the tx.
    metadata::sign_metadata(ctx.accounts.sign_metadata_ctx())?;

    if params.update_primary_sale_happened_via_token {
        // Set the primary sale has happened flag to true on metadata.
        metadata::update_primary_sale_happened_via_token(
            ctx.accounts.update_primary_sale_happened_ctx(),
        )?;
    }

    // emit!(XnftCreated {
    //     tag: params.tag,
    //     xnft: ctx.accounts.xnft.key(),
    // });

    Ok(())
}
