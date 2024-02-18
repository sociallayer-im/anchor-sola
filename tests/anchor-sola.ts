import { BN, Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { Keypair, Transaction } from "@solana/web3.js";
import { AnchorSola, wait, SolaClient } from "../src";

describe("anchor_sola", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const wallet = anchor.Wallet.local();
  const program = anchor.workspace.AnchorSola as Program<AnchorSola>;
  const name = "My Sola";

  const solaClient = new SolaClient(program, wallet.payer, name);

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

    const ix = await
      solaClient.getCreateInstruction(decimals, amount, params);

    console.log("Instruction:", ix);

    const tx = new Transaction().add(ix);

    console.log("Transaction:", tx);
    const ts = await anchor.getProvider().sendAndConfirm(tx);

    console.log("Transaction signature:", ts);
  });

  it("mints new tokens to a sola", async () => {
    const amount = new BN(100);

    const ix = await solaClient.getMintInstruction(amount);

    const tx = await
      anchor.getProvider().sendAndConfirm(new Transaction().add(ix));

    console.log("Transaction signature:", tx);
  });


  it("transfers tokens from one account to another", async () => {
    const destination = Keypair.generate();

    const ix = await solaClient.getTransferInstruction(new BN(10), destination.publicKey);

    const tx = await
      anchor.getProvider().sendAndConfirm(new Transaction().add(ix));;

    console.log("Transaction signature:", tx);
  });


  it("burns tokens from a sola", async () => {
    const amount = new BN(50);

    const ix = await solaClient.getBurnInstruction(amount);

    const tx = await
      anchor.getProvider().sendAndConfirm(new Transaction().add(ix));;

    console.log("Transaction signature:", tx);
  });

  it("deletes a sola", async () => {
    const ix = await solaClient.getDeleteInstruction();

    const tx = await
      anchor.getProvider().sendAndConfirm(new Transaction().add(ix));;

    console.log("Transaction signature:", tx);
  });

  // Add more tests as needed
});