use anchor_lang::{account, prelude::*};
use anchor_spl::metadata::mpl_token_metadata::MAX_NAME_LENGTH;

#[account]
#[derive(InitSpace)]
pub struct SolaProperty {
    /// The pubkey of the original SOLA creator (32).
    pub publisher: Pubkey,
    /// The pubkey of the MPL master metadata account (32).
    pub master_metadata: Pubkey,
    /// The pubkey of the master token mint (32).
    pub master_mint: Pubkey,
    pub is_burnable: bool,
    #[max_len(MAX_NAME_LENGTH)]
    pub name: String,
    /// The bump nonce for the SOLA's PDA (1).
    pub bump: [u8; 1],
}

impl SolaProperty {
    pub const LEN: usize = 8 + Self::INIT_SPACE;

    pub fn as_seeds(&self) -> [&[u8]; 3] {
        ["sola".as_bytes(), self.master_mint.as_ref(), &self.bump]
    }
}
