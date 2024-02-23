import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID } from "./common";
import BN from "bn.js";

/**
 * Derive the PDA of the master mint account.
 * @export
 * @param {BN} profileId
 * @returns {[PublicKey, number]}
 */
export function deriveMasterMintAddress(profileId: BN): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from("mint"), profileId.toBuffer("be", 8)], PROGRAM_ID);
}

export function deriveSolaProfileGlobalAddress(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from("sola_profile_global")], PROGRAM_ID);
}
export function deriveSolaCreatorAddress(creator: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from("sola_profile_creator"), deriveSolaProfileGlobalAddress()[0].toBytes(), creator.toBytes()], PROGRAM_ID);
}
export function deriveSolaDefaultProfilesAddress(publisher: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from("sola_default_profiles"), deriveSolaProfileGlobalAddress()[0].toBytes(), publisher.toBytes()], PROGRAM_ID);
}
export function getMasterMetadataAddress(masterMint: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBytes(), masterMint.toBytes()], TOKEN_METADATA_PROGRAM_ID);
}
export function getMasterEditionAddress(masterMint: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBytes(), masterMint.toBytes(), Buffer.from("edition")], TOKEN_METADATA_PROGRAM_ID);
}
export function getTokenRecordAddress(masterMint: PublicKey, masterToken: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBytes(), masterMint.toBytes(), Buffer.from("token_record"), masterToken.toBytes()], TOKEN_METADATA_PROGRAM_ID);
}

export function deriveSolaProfileAddress(masterMint: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from("sola_profile"), masterMint.toBytes()], PROGRAM_ID);
}
/**
 * Derive the PDA of the associated SOLA program account.
 * @export
 * @param {PublicKey} masterMint
 * @returns {[PublicKey, number]}
 */
export function deriveSolaAddress(masterMint: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from("sola"), masterMint.toBytes()], PROGRAM_ID);
}
