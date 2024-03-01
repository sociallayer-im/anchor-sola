import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

export const PROGRAM_ID = new PublicKey(
  "13QsVLZkzf9gRiFbFrUK9xhLa6QukFEdLxJUfbuta33L"
);

export const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface CreatorsParam {
  address: PublicKey;
  share: number;
}

export interface CreateSolaParams {
  creators: CreatorsParam[];
  curator: PublicKey;
  sellerFeeBasisPoints: number;
  symbol: string;
  uri: string;
  isBurnable: boolean;
  isMutable: boolean;
  updateAuthorityIsSigner: boolean;
  updatePrimarySaleHappenedViaToken: boolean;
}

export interface MintProfileParams {
  name: string;
  creators: CreatorsParam[];
  curator: PublicKey;
  sellerFeeBasisPoints: number;
  symbol: string;
  uri: string;
  isMutable: boolean;
}

export interface RegisterParams {
  fungible: boolean;
  transferable: boolean;
  revocable: boolean;
  address: PublicKey;
  schema: string;
}

export interface SetClassGenericParams {
  isGenericBadgeClass: boolean;
  isLineageBadgeClass: boolean;
}

export interface SetGroupControllerParams {
  isManager: boolean;
  isIssuer: boolean;
  isMember: boolean;
}

export interface SetTokenClassStateParams {
  isIssuer: boolean;
  isConsumer: boolean;
}

export interface MintBadgeParams {
  name: string;
  creators: CreatorsParam[];
  curator: PublicKey | null;
  sellerFeeBasisPoints: number;
  symbol: string;
  uri: string;
  isMutable: boolean;
  weights: anchor.BN;
  schema: string;
}
