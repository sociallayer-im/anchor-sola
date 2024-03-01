import * as anchor from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import { assert } from "chai";
import * as pda from "./addresses";
import { AnchorSola } from "./anchor_sola";
import { MintBadgeParams, MPL_TOKEN_METADATA_PROGRAM_ID } from "./common";
import { IRegistry, Mint } from "./registry";

export class BadgeProgram {
  program: anchor.Program<AnchorSola>;

  constructor(program: anchor.Program<AnchorSola>) {
    this.program = program;
  }

  async initializeeBadgeGlobal(
    uri: string,
    payer: web3.Keypair,
    owner?: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    return this.program.methods
      .initializeeBadgeGlobal(uri)
      .accounts({
        badgeGlobal: pda.badgeGlobal()[0],
        payer: payer.publicKey,
        owner: owner ? owner : payer.publicKey,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([payer])
      .instruction();
  }

  async mintBadge(
    classId: anchor.BN,
    params: MintBadgeParams,
    payer: web3.Keypair,
    to: web3.PublicKey,
    publisher?: web3.Keypair
  ): Promise<web3.TransactionInstruction> {
    return this._mintBadge(
      classId,
      params,
      [],
      payer,
      to,
      publisher ? publisher : payer,
      null,
      null
    );
  }

  async _mintBadge(
    classId: anchor.BN,
    params: MintBadgeParams,
    origins: anchor.BN[],
    payer: web3.Keypair,
    to: web3.PublicKey,
    publisher?: web3.Keypair,
    lineageOrigins?: undefined,
    genericOrigins?: undefined
  ): Promise<web3.TransactionInstruction> {
    const badgeGlobal = pda.badgeGlobal()[0];
    const badgeId = (await this.program.account.badgeGlobal.fetch(badgeGlobal))
      .counter;
    const badgeMint = pda.mintBadge(badgeId)[0];
    const mint = new Mint(badgeMint, to);
    const register = await IRegistry.new(this.program, classId);
    const registerMint = new Mint(
      register.profileMint,
      publisher ? publisher.publicKey : payer.publicKey
    );
    return this.program.methods
      .mintBadge(classId, params, origins)
      .accounts({
        badgeGlobal,
        masterToken: mint.masterToken,
        masterMint: mint.masterMint,
        masterMetadata: mint.masterMetadata,
        masterEdition: mint.masterEdition,
        tokenRecord: mint.tokenRecord,
        badgeState: pda.badgeState(badgeMint)[0],
        lineageOrigins: lineageOrigins
          ? pda.lineageOrigins(badgeMint)[0]
          : null,
        genericOrigins: genericOrigins
          ? pda.genericOrigins(badgeMint)[0]
          : null,
        tokenClass: register.tokenClass,
        profileMint: register.profileMint,
        profileToken: registerMint.masterToken,
        dispatcher: register.dispatcher,
        defaultDispatcher: register.defaultDispatcher,
        classGeneric: register.classGeneric,
        payer: payer.publicKey,
        publisher: publisher ? publisher.publicKey : payer.publicKey,
        to,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        splAtaProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
        sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers(publisher ? [payer, publisher] : [payer])
      .instruction();
  }

  async mintLineageBadge(
    classId: anchor.BN,
    params: MintBadgeParams,
    origins: anchor.BN[],
    payer: web3.Keypair,
    to: web3.PublicKey,
    publisher?: web3.Keypair
  ): Promise<web3.TransactionInstruction> {
    assert(origins.length != 0);
    return this._mintBadge(
      classId,
      params,
      origins,
      payer,
      to,
      publisher ? publisher : payer,
      undefined,
      null
    );
  }

  async mintGenericBadge(
    classId: anchor.BN,
    params: MintBadgeParams,
    genericOrigins: anchor.BN,
    payer: web3.Keypair,
    to: web3.PublicKey,
    publisher?: web3.Keypair
  ): Promise<web3.TransactionInstruction> {
    return this._mintBadge(
      classId,
      params,
      [genericOrigins],
      payer,
      to,
      publisher ? publisher : payer,
      null,
      undefined
    );
  }
}
