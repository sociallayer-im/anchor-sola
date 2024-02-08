import { BN, Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import * as spl from "@solana/spl-token";
import { Keypair, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { deriveMasterMintAddress, AnchorSola, TOKEN_METADATA_PROGRAM_ID, getMasterMetadataAddress, deriveSolaAddress, wait } from "../src";

describe("anchor_sola", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const wallet = anchor.Wallet.local();
  const program = anchor.workspace.AnchorSola as Program<AnchorSola>;
  anchor.getProvider().connection.sendEncodedTransaction
  const payer = wallet.publicKey;
  const authority = wallet.publicKey;
  const name = "My Sola";

  const [masterMint] = deriveMasterMintAddress(name, program.provider.publicKey);
  const masterToken = getAssociatedTokenAddressSync(masterMint, program.provider.publicKey);

  const [masterMetadata] = getMasterMetadataAddress(name, masterMint);
  let [sola] = deriveSolaAddress(masterMint);

  before("airdrop", async () => {
    const res = await program.provider.connection.requestAirdrop(wallet.publicKey, 100);
    console.log("airdrop result:", res);
    const banlance = await program.provider.connection.getBalance(wallet.payer.publicKey);
    console.log("banlance:", banlance);
    await wait(500);
  });

  it("creates a new sola", async () => {

    const decimals = 2;
    const amount = new BN(1000);
    const params = {
      creators: [
        {
          address: wallet.publicKey,
          share: 100,
        },
      ],
      curator: wallet.publicKey,
      sellerFeeBasisPoints: 0,
      symbol: "MSOL",
      uri: "https://example.com/my-sola.json",
      isBurnable: true,
      isMutable: true,
      updateAuthorityIsSigner: true,
      updatePrimarySaleHappenedViaToken: false,
    };

    const accounts = {
      masterMint,
      masterToken,
      masterMetadata,
      sola,
      payer,
      publisher: authority,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: spl.TOKEN_PROGRAM_ID,
      associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
      metadataProgram: TOKEN_METADATA_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    };
    console.log(`name:`, name);
    console.log(`decimals:`, decimals);
    console.log(`amount:`, amount);
    console.log(`params:`, params);
    console.log(`accounts:`, accounts);

    const ix = await program.methods
      .create(name, decimals, amount, params)
      .accounts({
        masterMint,
        masterToken,
        masterMetadata,
        sola,
        payer,
        publisher: authority,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        metadataProgram: TOKEN_METADATA_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([wallet.payer])
      .instruction();
    console.log("Instruction:", ix);

    const tx = new Transaction().add(ix);

    console.log("Transaction:", tx);
    const ts = await anchor.getProvider().sendAndConfirm(tx, [wallet.payer]);

    console.log("Transaction signature:", ts);
  });

  it("mints new tokens to a sola", async () => {
    const amount = new BN(100);

    const tx = await program.methods
      .mint("My Sola", amount)
      .accounts({
        masterMint,
        masterToken,
        sola,
        publisher: authority,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("Transaction signature:", tx);
  });


  it("transfers tokens from one account to another", async () => {
    const destination = Keypair.generate();

    const tx = await program.methods
      .transfer(new BN(10))
      .accounts({
        sola,
        source: masterToken,
        destination: getAssociatedTokenAddressSync(masterMint, destination.publicKey),
        masterMint,
        recipient: destination.publicKey,
        authority: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .signers([wallet.payer])
      .rpc();

    console.log("Transaction signature:", tx);
  });


  it("burns tokens from a sola", async () => {
    const amount = new BN(50);

    const tx = await program.methods
      .burn(amount)
      .signers([wallet.payer])
      .accounts({
        sola,
        masterMetadata,
        masterToken,
        masterMint,
        authority,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("Transaction signature:", tx);
  });

  it("deletes a sola", async () => {
    const receiver = payer;

    const tx = await program.methods
      .delete()
      .accounts({
        sola,
        masterMetadata,
        masterToken,
        masterMint,
        receiver,
        authority,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("Transaction signature:", tx);
  });

  // Add more tests as needed
});