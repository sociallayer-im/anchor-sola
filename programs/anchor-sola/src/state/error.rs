use anchor_lang::error_code;

#[error_code]
pub enum SolaError {
    #[msg("not support.")]
    NotSupport,
    #[msg("invalid token standard")]
    InvalidTokenStandard,
    #[msg("origins mismatch.")]
    OriginsMismatch,
    #[msg("no permission")]
    NoPermission,
    #[msg("When mint default profiles, profile id must be null.")]
    ProfileIdNotNull,
    #[msg("Not found default profiles in accounts.")]
    NotFoundDefaultProfiles,
    #[msg("Found default profiles in accounts.")]
    FoundDefaultProfiles,
    #[msg("The publisher is not the profile creator.")]
    NotProfileCreator,
    #[msg("incorrect owner.")]
    IncorrectOwner,
    #[msg("mint mismatch")]
    MintMismatch,
    #[msg("not enough tokens")]
    NotEnoughTokens,
    #[msg("invalid token extension type")]
    InvalidTokenExtensionType,
    #[msg("missing immutable owner extension")]
    MissingImmutableOwnerExtension,
}
