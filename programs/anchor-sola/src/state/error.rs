use anchor_lang::error_code;

#[error_code]
pub enum SolaError {
    #[msg("When mint default profiles, profile id must be null.")]
    ProfileIdNotNull,
    #[msg("Not found default profiles in accounts.")]
    NotFoundDefaultProfiles,
    #[msg("Found default profiles in accounts.")]
    FoundDefaultProfiles,
    #[msg("You cannot create a review for an SOLA that you currently own or published")]
    CannotReviewOwned,

    #[msg("There is already a verified curator assigned")]
    CuratorAlreadySet,

    #[msg("The expected curator authority did not match expected")]
    CuratorAuthorityMismatch,

    #[msg("The provided curator account did not match the one assigned")]
    CuratorMismatch,

    #[msg("The provided metadata not found curators.")]
    CuratorNotFound,
    #[msg("The profile curators is so much!")]
    CuratorsIsSoMuch,
    #[msg("The publisher is not the profile creator.")]
    NotProfileCreator,
    #[msg("The metadata of the SOLA is marked as immutable")]
    MetadataIsImmutable,

    #[msg("The rating for a review must be between 0 and 5")]
    RatingOutOfBounds,

    #[msg("Updated supply is less than the original supply set on creation")]
    SupplyReduction,

    #[msg("Attempting to install a currently suspended SOLA")]
    SuspendedInstallation,

    #[msg("The access account provided is not associated with the wallet")]
    UnauthorizedInstall,

    #[msg("A provided creator was not found on the metadata account")]
    UnknownCreator,

    #[msg("The signer did not match the update authority of the metadata account or the owner")]
    UpdateAuthorityMismatch,

    #[msg("The signing authority for the SOLA update did not match the review authority")]
    UpdateReviewAuthorityMismatch,

    #[msg("The metadata URI provided exceeds the maximum length")]
    UriExceedsMaxLength,

    #[msg("The SOLA is not deletable because its either an app with installations or has reviews")]
    SOLANotDeletable,
    #[msg("The SOLA is UnBurnable.")]
    UnBurnable,
}
