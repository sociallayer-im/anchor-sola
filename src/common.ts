import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey("13QsVLZkzf9gRiFbFrUK9xhLa6QukFEdLxJUfbuta33L");

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
