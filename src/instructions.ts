import { Program, BN, web3 } from "@coral-xyz/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { AnchorSola } from "./anchor_sola";
import { deriveMasterMintAddress, deriveSolaProfileAddress, deriveSolaProfileGlobalAddress, getMasterEditionAddress, getMasterMetadataAddress, getTokenRecordAddress, deriveSolaCreatorAddress, deriveSolaDefaultProfilesAddress } from "./addresses";
import { MintProfileParams, PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID } from "./common";

export class SolaClient {
    program: Program<AnchorSola>;
    wallet: web3.Keypair;
    owner: web3.Keypair;
    masterMint: web3.PublicKey;
    masterMetadata: web3.PublicKey;
    masterEdition: web3.PublicKey;
    solaCreator: web3.Keypair;
    tokenRecoud: web3.PublicKey;
    profileId: BN;
    solaProfile: web3.PublicKey;
    masterToken: web3.PublicKey;
    sola: web3.PublicKey;
    tokenRecord: web3.PublicKey;
    solaProfileGlobal: web3.PublicKey;

    constructor(program: Program<AnchorSola>, wallet: web3.Keypair) {
        this.program = program;
        this.wallet = wallet;

        this.solaProfileGlobal = deriveSolaProfileGlobalAddress()[0];
    }

    async getInitializeeInstruction(uri: string, chainId: BN, payer?: web3.Keypair, owner?: web3.Keypair): Promise<web3.TransactionInstruction> {


        const ix = await this.program.methods
            .initializee(chainId, uri)
            .accounts({
                solaProfileGlobal: this.solaProfileGlobal,
                payer: payer ? payer.publicKey : this.wallet.publicKey,
                owner: owner ? owner.publicKey : this.wallet.publicKey,
                systemProgram: web3.SystemProgram.programId,
                rent: web3.SYSVAR_RENT_PUBKEY,
            })
            .signers(payer ? [payer] : [this.wallet])
            .instruction();

        // TODO: 这里有问题，如果ix组成的tx交易失败的话，这里是需要撤回的
        this.owner = owner ? owner : this.wallet;

        return ix;
    }

    async getUpdateProfileGlobalInstruction(uri: string, chainId: BN, newOwner: web3.Keypair): Promise<web3.TransactionInstruction> {


        const ix = await this.program.methods
            .updateProfileGlobal(chainId, uri)
            .accounts({
                solaProfileGlobal: this.solaProfileGlobal,

                owner: this.owner.publicKey,
                newOwner: newOwner.publicKey,
                systemProgram: web3.SystemProgram.programId,
                rent: web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([this.owner])
            .instruction();

        // TODO: 这里有问题，如果ix组成的tx交易失败的话，这里是需要撤回的
        // 但是不知道在ts里这种情况该怎么优雅的处理，后续再考虑！
        this.owner = newOwner;

        return ix;
    }

    async getSetProfileCreatorInstruction(status: boolean, solaCreator?: web3.Keypair, payer?: web3.Keypair): Promise<web3.TransactionInstruction> {
        // TODO: 这里有问题，如果ix组成的tx交易失败的话，这里是需要撤回的
        this.solaCreator = solaCreator ? solaCreator : this.wallet;

        const ix = await this.program.methods
            .setProfileCreator(status)
            .accounts({
                solaProfileGlobal: this.solaProfileGlobal,
                solaCreator: deriveSolaCreatorAddress(this.solaCreator.publicKey)[0],
                payer: payer ? payer.publicKey : this.wallet.publicKey,
                owner: this.owner.publicKey,
                creator: this.solaCreator.publicKey,
                systemProgram: web3.SystemProgram.programId,
                rent: web3.SYSVAR_RENT_PUBKEY,
            })
            .signers(payer ? [payer, this.owner] : [this.wallet, this.owner])
            .instruction();

        return ix;
    }

    private async _getMintProfileInstruction(params: MintProfileParams, to: web3.PublicKey, profileId?: BN, addressDefaultProfiles?: web3.PublicKey, payer?: web3.Keypair): Promise<web3.TransactionInstruction> {
        const ix = await this.program.methods
            .mintProfile(profileId, params)
            .accounts({
                solaProfileGlobal: this.solaProfileGlobal,
                addressDefaultProfiles: addressDefaultProfiles ? addressDefaultProfiles : null,
                solaCreator: deriveSolaCreatorAddress(this.solaCreator.publicKey)[0],
                masterToken: this.masterToken,
                masterMint: this.masterMint,
                masterMetadata: this.masterMetadata,
                masterEdition: this.masterEdition,
                tokenRecord: this.tokenRecord,
                solaProfile: this.solaProfile,
                payer: payer ? payer.publicKey : this.wallet.publicKey,
                publisher: this.solaCreator.publicKey,
                to,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
                splAtaProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                metadataProgram: TOKEN_METADATA_PROGRAM_ID,
                sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
                rent: web3.SYSVAR_RENT_PUBKEY,
            })
            .signers(payer ? [payer, this.solaCreator] : [this.wallet, this.solaCreator])
            .instruction();

        return ix;
    }


    async getMintProfileInstruction(profileId: BN, params: MintProfileParams, to: web3.PublicKey, payer?: web3.Keypair): Promise<web3.TransactionInstruction> {
        // TODO: 这里有问题，如果ix组成的tx交易失败的话，这里是需要撤回的
        this.syncProfileWithTo(profileId, to);

        const ix = await this._getMintProfileInstruction(params, to, profileId, null, payer);

        return ix;
    }

    private syncProfile(profileId: BN) {
        if (this.profileId == profileId) {
            return;
        }
        this.profileId = profileId;
        this.masterMint = deriveMasterMintAddress(profileId)[0];
        this.masterEdition = getMasterEditionAddress(this.masterMint)[0];
        this.masterMetadata = getMasterMetadataAddress(this.masterMint)[0];
        this.solaProfile = deriveSolaProfileAddress(this.masterMint)[0];
    }

    private syncProfileTo(to: web3.PublicKey) {
        this.masterToken = getAssociatedTokenAddressSync(this.masterMint, to, false, TOKEN_2022_PROGRAM_ID);
        this.tokenRecord = getTokenRecordAddress(this.masterMint, this.masterToken)[0];
    }

    private syncProfileWithTo(profileId: BN, to: web3.PublicKey) {
        if (this.profileId == profileId) {
            this.syncProfileTo(to);
            return;
        }
        this.syncProfile(profileId);
        this.syncProfileTo(to);
    }

    async getMintDefaultProfileInstruction(params: MintProfileParams, to: web3.PublicKey, payer?: web3.Keypair): Promise<web3.TransactionInstruction> {
        const profileId = (await this.program.account.solaProfileGlobal.all()).pop().account.counter;
        console.log('default profileId:', profileId);
        // TODO: 这里有问题，如果ix组成的tx交易失败的话，这里是需要撤回的
        this.syncProfileWithTo(profileId, to);

        const ix = await this._getMintProfileInstruction(params, to, null, deriveSolaDefaultProfilesAddress(to)[0], payer);

        return ix;
    }


    async getMintGroupProfileInstruction(params: MintProfileParams, to: web3.PublicKey, payer?: web3.Keypair): Promise<web3.TransactionInstruction> {
        const profileId = (await this.program.account.solaProfileGlobal.all()).pop().account.counter;
        console.log('default profileId:', profileId);
        // TODO: 这里有问题，如果ix组成的tx交易失败的话，这里是需要撤回的
        this.syncProfileWithTo(profileId, to);

        const ix = await this._getMintProfileInstruction(params, to, null, null, payer);

        return ix;
    }

    async getBurnProfileInstruction(profileId: BN, owner?: web3.Keypair, close?: web3.PublicKey): Promise<web3.TransactionInstruction> {
        this.syncProfile(profileId);
        const account = (await this.program.account.solaProfile.fetch(this.solaProfile, "confirmed"));

        console.log('will burn profile:', profileId);

        const ix = await this.program.methods
            .burnProfile(profileId)
            .accounts({
                solaProfileGlobal: this.solaProfileGlobal,
                addressDefaultProfiles: account.addressDefaultProfiles ? account.addressDefaultProfiles : null,
                masterToken: this.masterToken,
                masterMint: this.masterMint,
                masterMetadata: this.masterMetadata,
                masterEdition: this.masterEdition,
                tokenRecord: this.tokenRecord,
                solaProfile: this.solaProfile,
                close: close ? close : this.wallet.publicKey,
                owner: owner ? owner.publicKey : this.wallet.publicKey,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
                splAtaProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                metadataProgram: TOKEN_METADATA_PROGRAM_ID,
                sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
                rent: web3.SYSVAR_RENT_PUBKEY,
            })
            .signers(owner ? [owner] : [this.wallet])
            .instruction();

        return ix;
    }

    // async getCreateInstruction(decimals: number, amount: BN, params: CreateSolaParams, to?: web3.PublicKey, payer?: web3.Keypair): Promise<web3.TransactionInstruction> {
    //     const accounts = {
    //         masterMint: this.masterMint,
    //         masterToken: to ? getAssociatedTokenAddressSync(this.masterMint, to, false, this.tokenProgram) : getAssociatedTokenAddressSync(this.masterMint, this.wallet.publicKey, false, this.tokenProgram),
    //         masterMetadata: this.masterMetadata,
    //         sola: this.sola,
    //         payer: payer ? payer.publicKey : this.wallet.publicKey,
    //         publisher: this.wallet.publicKey,
    //         systemProgram: web3.SystemProgram.programId,
    //         tokenProgram: this.tokenProgram,
    //         associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    //         metadataProgram: TOKEN_METADATA_PROGRAM_ID,
    //         rent: web3.SYSVAR_RENT_PUBKEY,
    //     };

    //     const ix = await this.program.methods
    //         .create(this.name, decimals, amount, params)
    //         .accounts(accounts)
    //         .signers(payer ? [payer, this.wallet] : [this.wallet])
    //         .instruction();

    //     return ix;
    // }

    // async getMintInstruction(amount: BN, to?: web3.PublicKey): Promise<web3.TransactionInstruction> {
    //     const accounts = {
    //         masterMint: this.masterMint,
    //         masterToken: to ? getAssociatedTokenAddressSync(this.masterMint, to, false, this.tokenProgram) : getAssociatedTokenAddressSync(this.masterMint, this.wallet.publicKey, false, this.tokenProgram),
    //         sola: this.sola,
    //         publisher: this.wallet.publicKey,
    //         systemProgram: web3.SystemProgram.programId,
    //         tokenProgram: this.tokenProgram,
    //         rent: web3.SYSVAR_RENT_PUBKEY,
    //     };

    //     const ix = await this.program.methods
    //         .mint(this.name, amount)
    //         .accounts(accounts)
    //         .signers([this.wallet])
    //         .instruction();

    //     return ix;
    // }

    // async getTransferInstruction(amount: BN, destination: web3.PublicKey, source?: web3.PublicKey): Promise<web3.TransactionInstruction> {
    //     const destinationToken = getAssociatedTokenAddressSync(this.masterMint, destination, false, this.tokenProgram);

    //     const accounts = {
    //         sola: this.sola,
    //         source: source ? getAssociatedTokenAddressSync(this.masterMint, source, false, this.tokenProgram) : getAssociatedTokenAddressSync(this.masterMint, this.wallet.publicKey, false, this.tokenProgram),
    //         destination: destinationToken,
    //         masterMint: this.masterMint,
    //         recipient: destination,
    //         authority: this.wallet.publicKey,
    //         tokenProgram: this.tokenProgram,
    //     };

    //     const ix = await this.program.methods
    //         .transfer(amount)
    //         .accounts(accounts)
    //         .signers([this.wallet])
    //         .instruction();

    //     return ix;
    // }

    // async getBurnInstruction(amount: BN, source?: web3.PublicKey): Promise<web3.TransactionInstruction> {
    //     const accounts = {
    //         sola: this.sola,
    //         masterMetadata: this.masterMetadata,
    //         masterToken: source ? getAssociatedTokenAddressSync(this.masterMint, source, false, this.tokenProgram) : getAssociatedTokenAddressSync(this.masterMint, this.wallet.publicKey, false, this.tokenProgram),
    //         masterMint: this.masterMint,
    //         authority: this.wallet.publicKey,
    //         tokenProgram: this.tokenProgram,
    //     };

    //     const ix = await this.program.methods
    //         .burn(amount)
    //         .accounts(accounts)
    //         .signers([this.wallet])
    //         .instruction();

    //     return ix;
    // }

    // async getDeleteInstruction(source?: web3.PublicKey, receiver?: web3.PublicKey,): Promise<web3.TransactionInstruction> {

    //     const accounts = {
    //         sola: this.sola,
    //         masterMetadata: this.masterMetadata,
    //         masterToken: source ? getAssociatedTokenAddressSync(this.masterMint, source, false, this.tokenProgram) : getAssociatedTokenAddressSync(this.masterMint, this.wallet.publicKey, false, this.tokenProgram),
    //         masterMint: this.masterMint,
    //         receiver: receiver ? receiver : this.wallet.publicKey,
    //         authority: this.wallet.publicKey,
    //         tokenProgram: this.tokenProgram,
    //     };

    //     const ix = await this.program.methods
    //         .delete()
    //         .accounts(accounts)
    //         .signers([this.wallet])
    //         .instruction();

    //     return ix;
    // }
}