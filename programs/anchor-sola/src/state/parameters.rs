use anchor_lang::prelude::*;

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreatorsParam {
    pub address: Pubkey,
    pub share: u8,
}
