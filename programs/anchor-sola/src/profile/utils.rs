use std::ops::Deref;

use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke, system_program},
};
use anchor_spl::token_2022::{
    initialize_mint_close_authority,
    spl_token_2022::{
        self,
        extension::{metadata_pointer, BaseStateWithExtensions, ExtensionType},
        native_mint::DECIMALS,
        state::Mint,
    },
    Token2022,
};
use mpl_token_metadata::types::TokenStandard;

use crate::{state::SolaError, Dispatcher, GroupController};

pub fn is_owner(
    master_token: &UncheckedAccount<'_>,
    authority: &Signer<'_>,
    master_mint: &AccountInfo<'_>,
    spl_token_program: &Program<'_, Token2022>,
) -> bool {
    validate_token(
        master_mint.as_ref(),
        master_token.as_ref(),
        Some(authority),
        spl_token_program,
        Some(TokenStandard::ProgrammableNonFungible),
        Some(1),
    )
    .ok()
    .is_some()
}

pub fn is_dispatcher<'info: 'ref_info, 'ref_info>(
    dispatcher: &'ref_info UncheckedAccount<'info>,
    default_dispatcher: &'ref_info Account<'info, Dispatcher>,
    authority: &'ref_info Signer<'info>,
) -> bool {
    let dispatcher = RefAccount::<Dispatcher>::new(dispatcher.as_ref());
    dispatcher
        .map(|inner| inner.dispatcher)
        .unwrap_or(default_dispatcher.dispatcher)
        == authority.key()
}

pub fn is_group_manager(group_controller: &UncheckedAccount<'_>) -> bool {
    RefAccount::<GroupController>::new(group_controller.as_ref())
        .map(|gp| gp.is_manager)
        .unwrap_or(false)
}

#[derive(Clone)]
pub struct RefAccount<'info, 'ref_info, T> {
    account: T,
    _info: &'ref_info AccountInfo<'info>,
}

impl<'info: 'ref_info, 'ref_info, T: AccountSerialize + AccountDeserialize + Owner + Clone>
    RefAccount<'info, 'ref_info, T>
{
    pub fn new(info: &'ref_info AccountInfo<'info>) -> Option<Self> {
        if info.owner == &system_program::ID && info.lamports() == 0 {
            return None;
        }
        if info.owner != &T::owner() {
            return None;
        }
        let mut data: &[u8] = &info.try_borrow_data().ok()?;
        Some(RefAccount {
            _info: info,
            account: T::try_deserialize(&mut data).ok()?,
        })
    }
}

impl<'info, 'ref_info, T> Deref for RefAccount<'info, 'ref_info, T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        &self.account
    }
}

/// Creates a mint account for the given token standard.
///
/// When creating a mint with spl-token-2022, the following extensions are enabled:
///
/// - mint close authority extension enabled and set to the metadata account
/// - metadata pointer extension enabled and set to the metadata account
/// - non transferable extension enabled and set to ths mint account
pub fn create_non_transferable_mint<
    'info: 'ref_info,
    'ref_info,
    T: AccountSerialize + AccountDeserialize + Owner + Clone,
>(
    mint: &'ref_info UncheckedAccount<'info>,
    metadata: &'ref_info UncheckedAccount<'info>,
    authority: &'ref_info Account<'info, T>,
    payer: &'ref_info Signer<'info>,
    token_standard: TokenStandard,
    decimals: Option<u8>,
    spl_token_program: &'ref_info Program<'info, Token2022>,
    system_program: &'ref_info Program<'info, System>,
    mint_seeds: &'ref_info [&'ref_info [u8]],
) -> Result<()> {
    let mint_account_size = ExtensionType::try_calculate_account_len::<Mint>(&[
        ExtensionType::MintCloseAuthority,
        ExtensionType::MetadataPointer,
        ExtensionType::NonTransferable,
    ])?;

    let cpi_accounts = anchor_lang::system_program::CreateAccount {
        from: payer.to_account_info(),
        to: mint.to_account_info(),
    };
    let cpi_context =
        anchor_lang::context::CpiContext::new(system_program.to_account_info(), cpi_accounts);

    anchor_lang::system_program::create_account(
        cpi_context.with_signer(&[&mint_seeds]),
        Rent::get()?.minimum_balance(mint_account_size),
        mint_account_size as u64,
        spl_token_program.key,
    )?;

    let cpi_accounts = anchor_spl::token_2022::InitializeMintCloseAuthority {
        mint: mint.to_account_info(),
    };

    initialize_mint_close_authority(
        CpiContext::new(spl_token_program.to_account_info(), cpi_accounts),
        Some(&metadata.key()),
    )?;

    let account_infos = vec![
        mint.to_account_info(),
        metadata.to_account_info(),
        spl_token_program.to_account_info(),
    ];

    invoke(
        &spl_token_2022::instruction::initialize_non_transferable_mint(
            spl_token_program.key,
            mint.key,
        )?,
        &[mint.to_account_info(), spl_token_program.to_account_info()],
    )?;

    invoke(
        &metadata_pointer::instruction::initialize(
            spl_token_program.key,
            mint.key,
            None,
            Some(*metadata.key),
        )?,
        &account_infos,
    )?;

    let decimals = match token_standard {
        // for NonFungible variants, we ignore the argument and
        // always use 0 decimals
        TokenStandard::NonFungible | TokenStandard::ProgrammableNonFungible => 0,
        // for Fungile variants, we either use the specified decimals or the default
        // DECIMALS from spl-token
        TokenStandard::FungibleAsset | TokenStandard::Fungible => match decimals {
            Some(decimals) => decimals,
            // if decimals not provided, use the default
            None => DECIMALS,
        },
        _ => {
            return Err(SolaError::InvalidTokenStandard.into());
        }
    };

    // initializing the mint account
    invoke(
        &spl_token_2022::instruction::initialize_mint2(
            spl_token_program.key,
            mint.key,
            &authority.key(),
            Some(&authority.key()),
            decimals,
        )?,
        &[mint.to_account_info(), authority.to_account_info()],
    )?;

    Ok(())
}

/// Validates a token account for the given token standard.
///
/// For non-fungible assets, the validation consists of checking that the token account
/// has not other extension than the `ExtensionType::ImmutableOwner`.
pub fn validate_token(
    mint: &AccountInfo,
    token: &AccountInfo,
    token_owner: Option<&AccountInfo>,
    spl_token_program: &AccountInfo,
    token_standard: Option<TokenStandard>,
    required_amount: Option<u64>,
) -> Result<spl_token_2022::state::Account> {
    if token.owner != spl_token_program.key {
        return Err(SolaError::IncorrectOwner.into());
    }

    let token_data = &token.data.borrow();
    let token =
        spl_token_2022::extension::StateWithExtensions::<spl_token_2022::state::Account>::unpack(
            token_data,
        )?;

    if token.base.mint != *mint.key {
        return Err(SolaError::MintMismatch.into());
    }

    if let Some(token_owner) = token_owner {
        if token.base.owner != *token_owner.key {
            return Err(SolaError::IncorrectOwner.into());
        }
    }

    if let Some(amount) = required_amount {
        if token.base.amount != amount {
            return Err(SolaError::NotEnoughTokens.into());
        }
    }

    if matches!(
        token_standard,
        Some(TokenStandard::NonFungible) | Some(TokenStandard::ProgrammableNonFungible)
    ) {
        // validates the mint extensions
        token
            .get_extension_types()?
            .iter()
            .try_for_each(|extension_type| {
                if !NON_FUNGIBLE_TOKEN_EXTENSIONS.contains(extension_type) {
                    msg!("Invalid token extension: {:?}", extension_type);
                    return Err(SolaError::InvalidTokenExtensionType);
                }
                Ok(())
            })?;
    }

    let mint_data = &mint.data.borrow();
    let mint =
        spl_token_2022::extension::StateWithExtensions::<spl_token_2022::state::Mint>::unpack(
            mint_data,
        )?;

    // if the mint has the NonTransferable extension set, then the token
    // must have the ImmutableOwner extension set
    if let Ok(_extension) =
        mint.get_extension::<spl_token_2022::extension::non_transferable::NonTransferable>()
    {
        if let Err(_err) =
            token.get_extension::<spl_token_2022::extension::immutable_owner::ImmutableOwner>()
        {
            return Err(SolaError::MissingImmutableOwnerExtension.into());
        }
    }

    Ok(token.base)
}

const NON_FUNGIBLE_TOKEN_EXTENSIONS: &[ExtensionType] = &[
    ExtensionType::ImmutableOwner,
    ExtensionType::NonTransferableAccount,
];
