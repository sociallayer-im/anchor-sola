use anchor_lang::prelude::*;

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreatorsParam {
    pub address: Pubkey,
    pub share: u8,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreateSolaParams {
    pub creators: Vec<CreatorsParam>,
    pub curator: Option<Pubkey>,
    pub seller_fee_basis_points: u16,
    pub symbol: String,
    pub uri: String,
    pub is_burnable: bool,
    pub is_mutable: bool,
    pub update_authority_is_signer: bool,
    pub update_primary_sale_happened_via_token: bool,
}
