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
    profileId: anchor.BN,
    badgeId: anchor.BN,
    classId: anchor.BN,
    params: MintBadgeParams,
    payer: web3.Keypair,
    to: web3.PublicKey,
    publisher?: web3.Keypair
  ): Promise<web3.TransactionInstruction> {
    return this._mintBadge(
      profileId,
      badgeId,
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
    profileId: anchor.BN,
    badgeId: anchor.BN,
    classId: anchor.BN,
    params: MintBadgeParams,
    origins: anchor.BN[],
    payer: web3.Keypair,
    to: web3.PublicKey,
    publisher?: web3.Keypair,
    lineageOrigins?: undefined,
    genericOrigins?: undefined
  ): Promise<web3.TransactionInstruction> {
    const badgeMint = pda.mintBadge(badgeId)[0];
    const mint = new Mint(badgeMint, to);
    const register = new IRegistry(classId, profileId);
    const registerMint = new Mint(
      register.profileMint,
      publisher ? publisher.publicKey : payer.publicKey
    );
    return this.program.methods
      .mintBadge(badgeId, classId, origins, params)
      .accounts({
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
      .remainingAccounts([
        register.tokenClass,
        register.profileMint,
        registerMint.masterToken,
        register.dispatcher,
        register.defaultDispatcher,
        register.classGeneric,]
        .map(account => {
          return {
            pubkey: account,
            isSigner: false,
            isWritable: false,
          }
        })
      )
      .signers(publisher ? [payer, publisher] : [payer])
      .instruction();
  }

  async mintLineageBadge(
    profileId: anchor.BN,
    badgeId: anchor.BN,
    classId: anchor.BN,
    params: MintBadgeParams,
    origins: anchor.BN[],
    payer: web3.Keypair,
    to: web3.PublicKey,
    publisher?: web3.Keypair
  ): Promise<web3.TransactionInstruction> {
    assert(origins.length != 0);
    return this._mintBadge(
      profileId,
      badgeId,
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
    profileId: anchor.BN,
    badgeId: anchor.BN,
    classId: anchor.BN,
    params: MintBadgeParams,
    genericOrigins: anchor.BN,
    payer: web3.Keypair,
    to: web3.PublicKey,
    publisher?: web3.Keypair
  ): Promise<web3.TransactionInstruction> {
    return this._mintBadge(
      profileId,
      badgeId,
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


  /// 具体的nft数据看这个教程：https://developers.metaplex.com/token-metadata/fetch
  async featchBadges(owner: web3.PublicKey, commitment?: web3.Commitment): Promise<{
    badgeId: anchor.BN;
    metaTable: anchor.BN;
    weights: anchor.BN;
    tokenSchema: string;
    mint: web3.PublicKey;
    metadata: web3.PublicKey;
    edition: web3.PublicKey;
  }[]> {
    /// 主要是改动这里，现在是通过owner
    const allTokens = (await this.program.provider.connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_2022_PROGRAM_ID }, commitment ? commitment : "confirmed")).value
      .map(token => {
        return pda.badgeState(token.pubkey)[0];
      });
    /// 类似的可以换成publisher：
    // 
    // import { fetchAllDigitalAssetByCreator } from '@metaplex-foundation/mpl-token-metadata'
    // // Assets such that the creator is first in the Creator array.
    // const assetsA = await fetchAllDigitalAssetByCreator(umi, creator)
    // // Assets such that the creator is second in the Creator array.
    // const assetsB = await fetchAllDigitalAssetByCreator(umi, creator, {
    //   position: 2,
    // })
    const badges = (await this.program.account.badgeState.fetchMultiple(allTokens)).filter(badge => badge)
      .map(badge => {
        return {
          badgeId: new anchor.BN(badge.badgeId, 8, "be"),
          metaTable: badge.metatable,
          weights: badge.weights,
          tokenSchema: badge.tokenSchema,
          mint: badge.masterMint,
          metadata: badge.masterMetadata,
          edition: badge.masterEdition
        }
      });

    return badges;
  }
}
