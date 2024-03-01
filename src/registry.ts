import * as web3 from "@solana/web3.js";
import { AnchorSola } from "./anchor_sola";
import * as anchor from "@coral-xyz/anchor";
import * as pda from "./addresses";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

export class IRegistry {
  tokenClass: web3.PublicKey;
  profileMint: web3.PublicKey;
  dispatcher: web3.PublicKey;
  defaultDispatcher: web3.PublicKey;
  classGeneric: web3.PublicKey;

  public static async new(
    program: anchor.Program<AnchorSola>,
    classId: anchor.BN
  ): Promise<IRegistry> {
    const res = new IRegistry();
    res.tokenClass = pda.tokenClass(classId)[0];
    const controllerId = (
      await program.account.tokenClass.fetch(res.tokenClass, "confirmed")
    ).controller;
    res.profileMint = pda.mintProfile(controllerId)[0];
    res.dispatcher = pda.dispatcher(res.profileMint)[0];
    res.defaultDispatcher = pda.defaultDispatcher()[0];
    res.classGeneric = pda.classGeneric(res.tokenClass)[0];
    return res;
  }

  constructor() {}
}

export class Mint {
  to: web3.PublicKey;
  masterToken: web3.PublicKey;
  masterMint: web3.PublicKey;
  masterMetadata: web3.PublicKey;
  masterEdition: web3.PublicKey;
  tokenRecord: web3.PublicKey;

  constructor(masterMint: web3.PublicKey, to: web3.PublicKey) {
    this.masterMint = masterMint;
    this.to = to;
    this.masterToken = getAssociatedTokenAddressSync(
      this.masterMint,
      to,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    this.masterEdition = pda.getMasterEditionAddress(this.masterMint)[0];
    this.masterMetadata = pda.getMasterMetadataAddress(this.masterMint)[0];
    this.tokenRecord = pda.getTokenRecordAddress(
      this.masterMint,
      this.masterToken
    )[0];
  }
}
