import { Program, BN, web3 } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { AnchorSola } from "./anchor_sola";
import { deriveMasterMintAddress, deriveSolaAddress, getMasterMetadataAddress } from "./addresses";
import { CreateSolaParams, TOKEN_METADATA_PROGRAM_ID } from "./common";

export class SolaClient {
    program: Program<AnchorSola>;
    wallet: web3.Keypair;
    name: string;
    masterMint: web3.PublicKey;
    masterMetadata: web3.PublicKey;
    sola: web3.PublicKey;
    tokenProgram: web3.PublicKey;

    constructor(program: Program<AnchorSola>, wallet: web3.Keypair, name: string) {
        this.program = program;
        this.wallet = wallet;
        this.name = name;
        this.masterMint = deriveMasterMintAddress(name, program.provider.publicKey)[0];
        this.masterMetadata = getMasterMetadataAddress(name, this.masterMint)[0];
        this.sola = deriveSolaAddress(this.masterMint)[0];
        this.tokenProgram = TOKEN_PROGRAM_ID;
    }

    async getCreateInstruction(decimals: number, amount: BN, params: CreateSolaParams, to?: web3.PublicKey, payer?: web3.Keypair): Promise<web3.TransactionInstruction> {
        const accounts = {
            masterMint: this.masterMint,
            masterToken: to ? getAssociatedTokenAddressSync(this.masterMint, to) : getAssociatedTokenAddressSync(this.masterMint, this.wallet.publicKey),
            masterMetadata: this.masterMetadata,
            sola: this.sola,
            payer: payer ? payer.publicKey : this.wallet.publicKey,
            publisher: this.wallet.publicKey,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: this.tokenProgram,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            metadataProgram: TOKEN_METADATA_PROGRAM_ID,
            rent: web3.SYSVAR_RENT_PUBKEY,
        };

        const ix = await this.program.methods
            .create(this.name, decimals, amount, params)
            .accounts(accounts)
            .signers(payer ? [payer, this.wallet] : [this.wallet])
            .instruction();

        return ix;
    }

    async getMintInstruction(amount: BN, to?: web3.PublicKey): Promise<web3.TransactionInstruction> {
        const accounts = {
            masterMint: this.masterMint,
            masterToken: to ? getAssociatedTokenAddressSync(this.masterMint, to) : getAssociatedTokenAddressSync(this.masterMint, this.wallet.publicKey),
            sola: this.sola,
            publisher: this.wallet.publicKey,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: this.tokenProgram,
            rent: web3.SYSVAR_RENT_PUBKEY,
        };

        const ix = await this.program.methods
            .mint(this.name, amount)
            .accounts(accounts)
            .signers([this.wallet])
            .instruction();

        return ix;
    }

    async getTransferInstruction(amount: BN, destination: web3.PublicKey, source?: web3.PublicKey): Promise<web3.TransactionInstruction> {
        const destinationToken = getAssociatedTokenAddressSync(this.masterMint, destination);

        const accounts = {
            sola: this.sola,
            source: source ? getAssociatedTokenAddressSync(this.masterMint, source) : getAssociatedTokenAddressSync(this.masterMint, this.wallet.publicKey),
            destination: destinationToken,
            masterMint: this.masterMint,
            recipient: destination,
            authority: this.wallet.publicKey,
            tokenProgram: this.tokenProgram,
        };

        const ix = await this.program.methods
            .transfer(amount)
            .accounts(accounts)
            .signers([this.wallet])
            .instruction();

        return ix;
    }

    async getBurnInstruction(amount: BN, source?: web3.PublicKey): Promise<web3.TransactionInstruction> {
        const accounts = {
            sola: this.sola,
            masterMetadata: this.masterMetadata,
            masterToken: source ? getAssociatedTokenAddressSync(this.masterMint, source) : getAssociatedTokenAddressSync(this.masterMint, this.wallet.publicKey),
            masterMint: this.masterMint,
            authority: this.wallet.publicKey,
            tokenProgram: this.tokenProgram,
        };

        const ix = await this.program.methods
            .burn(amount)
            .accounts(accounts)
            .signers([this.wallet])
            .instruction();

        return ix;
    }

    async getDeleteInstruction(source?: web3.PublicKey, receiver?: web3.PublicKey,): Promise<web3.TransactionInstruction> {

        const accounts = {
            sola: this.sola,
            masterMetadata: this.masterMetadata,
            masterToken: source ? getAssociatedTokenAddressSync(this.masterMint, source) : getAssociatedTokenAddressSync(this.masterMint, this.wallet.publicKey),
            masterMint: this.masterMint,
            receiver: receiver ? receiver : this.wallet.publicKey,
            authority: this.wallet.publicKey,
            tokenProgram: this.tokenProgram,
        };

        const ix = await this.program.methods
            .delete()
            .accounts(accounts)
            .signers([this.wallet])
            .instruction();

        return ix;
    }
}