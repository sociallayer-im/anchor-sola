import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID } from "./common";

/**
 * Derive the PDA of the master mint account.
 * @export
 * @param {string} name
 * @param {PublicKey} publisher
 * @returns {[PublicKey, number]}
 */
export function deriveMasterMintAddress(name: string, publisher: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from("mint"), publisher.toBytes(), Buffer.from(name)], PROGRAM_ID);
}

export function getMasterMetadataAddress(name: string, masterMint: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBytes(), masterMint.toBytes()], TOKEN_METADATA_PROGRAM_ID);
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
