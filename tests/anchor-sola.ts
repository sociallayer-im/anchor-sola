import { BN, Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { ComputeBudgetProgram, Keypair, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { AnchorSola, wait, SolaClient } from "../src";

describe("anchor_sola", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const wallet = anchor.Wallet.local();
  const program = anchor.workspace.AnchorSola as Program<AnchorSola>;

  const solaClient = new SolaClient(program, wallet.payer);


  before("airdrop", async () => {
    const res = await program.provider.connection.requestAirdrop(wallet.publicKey, 100);
    console.log("airdrop result:", res);
    const banlance = await program.provider.connection.getBalance(wallet.payer.publicKey);
    console.log("banlance:", banlance);
    await wait(500);
  });

  it("init a profile", async () => {
    const ix = await
      solaClient.getInitializeeInstruction("https://example.com/my-sola.json", new BN(111));

    console.log("Instruction:", ix);

    const tx = await
      anchor.getProvider().sendAndConfirm(new Transaction().add(ix), [], { skipPreflight: true });

    console.log("Transaction signature:", tx);

    await wait(1000);

    const res = await anchor.getProvider().connection.getParsedTransaction(tx, { commitment: "confirmed" });

    console.log("Transaction res:", res);

    const global = await program.account.solaProfileGlobal.all();
    console.log("init global:", global);
  });

  it("set profile creator", async () => {
    const ix = await
      solaClient.getSetProfileCreatorInstruction(true);

    console.log("Instruction:", ix);

    const tx = await
      anchor.getProvider().sendAndConfirm(new Transaction().add(ix), [], { skipPreflight: true });

    console.log("Transaction signature:", tx);

    await wait(1000);

    const res = await anchor.getProvider().connection.getParsedTransaction(tx, { commitment: "confirmed" });

    console.log("Transaction res:", res);


    const isProfileCreator = await program.account.isProfileCreator.all();
    console.log("isProfileCreator:", isProfileCreator);
  });

  it("update a global", async () => {
    const ix = await
      solaClient.getUpdateProfileGlobalInstruction("https://example.com/my-sola.json", new BN(777), wallet.payer);

    console.log("Instruction:", ix);

    const tx = await
      anchor.getProvider().sendAndConfirm(new Transaction().add(ix), [], { skipPreflight: true });

    console.log("Transaction signature:", tx);

    await wait(1000);

    const res = await anchor.getProvider().connection.getParsedTransaction(tx, { commitment: "confirmed" });

    console.log("Transaction res:", res);

    const global = await program.account.solaProfileGlobal.all();
    console.log("update global:", global);
  });

  it("mint a profile", async () => {
    const test_profile_owner = Keypair.generate();
    const params = {
      name: "MyProfile",
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
      isMutable: true,
    };

    const ix = await
      solaClient.getMintProfileInstruction(new BN(2412), params, test_profile_owner.publicKey);

    console.log("Instruction:", ix);

    const tx = await
      anchor.getProvider().sendAndConfirm(
        new Transaction()
          // 加钱！！！
          .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }))
          .add(ix)
        , [], { skipPreflight: true });

    console.log("Transaction signature:", tx);

    await wait(1000);

    const res = await anchor.getProvider().connection.getParsedTransaction(tx, { commitment: "confirmed" });

    console.log("Transaction res:", res);


    const global = await program.account.solaProfileGlobal.all();
    console.log("update global:", global);
    const profile = await program.account.solaProfile.all();
    console.log("all profile:", profile);
  });

  it("mint a default profile", async () => {
    const test_profile_owner = Keypair.generate();
    const params = {
      name: "MyDefaultProfile",
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
      isMutable: true,
    };

    const ix = await
      solaClient.getMintDefaultProfileInstruction(params, test_profile_owner.publicKey);

    console.log("Instruction:", ix);

    const tx = await
      anchor.getProvider().sendAndConfirm(
        new Transaction()
          // 加钱！！！
          .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }))
          .add(ix),
        [], { skipPreflight: true });

    console.log("Transaction signature:", tx);

    await wait(1000);

    const res = await anchor.getProvider().connection.getParsedTransaction(tx, { commitment: "confirmed" });

    console.log("Transaction res:", res);

    const global = await program.account.solaProfileGlobal.all();
    console.log("update global:", global);
    const profile = await program.account.solaProfile.all();
    console.log("all profile:", profile);
    const defaultProfile = await program.account.defaultProfileId.all();
    console.log("all profile:", defaultProfile);
  });

  it("mint a group profile", async () => {
    const test_profile_owner = Keypair.generate();
    const params = {
      name: "MyGroupProfile",
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
      isMutable: true,
    };

    const ix = await
      solaClient.getMintGroupProfileInstruction(params, test_profile_owner.publicKey);

    console.log("Instruction:", ix);

    const tx = await
      anchor.getProvider().sendAndConfirm(
        new Transaction()
          // 加钱！！！
          .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }))
          .add(ix),
        [], { skipPreflight: true });
    console.log("Transaction signature:", tx);

    await wait(1000);

    const res = await anchor.getProvider().connection.getParsedTransaction(tx, { commitment: "confirmed" });

    console.log("Transaction res:", res);



    const global = await program.account.solaProfileGlobal.all();
    console.log("update global:", global);
    const profile = await program.account.solaProfile.all();
    console.log("all profile:", profile);
    const defaultProfile = await program.account.defaultProfileId.all();
    console.log("default profile:", defaultProfile);
  });
  // it("creates a new sola", async () => {

  //   const decimals = 2;
  //   const amount = new BN(1000);
  //   const params = {
  //     creators: [
  //       {
  //         address: wallet.publicKey,
  //         share: 100,
  //       },
  //     ],
  //     curator: wallet.publicKey,
  //     sellerFeeBasisPoints: 0,
  //     symbol: "MSOL",
  //     uri: "https://example.com/my-sola.json",
  //     isBurnable: true,
  //     isMutable: true,
  //     updateAuthorityIsSigner: true,
  //     updatePrimarySaleHappenedViaToken: false,
  //   };

  //   const ix = await
  //     solaClient.getCreateInstruction(decimals, amount, params);

  //   console.log("Instruction:", ix);

  //   const tx = await
  //     anchor.getProvider().sendAndConfirm(new Transaction().add(ix), [], { skipPreflight: true });

  //   console.log("Transaction signature:", tx);
  // });

  // it("mints new tokens to a sola", async () => {
  //   const amount = new BN(100);

  //   const ix = await solaClient.getMintInstruction(amount);

  //   const tx = await
  //     anchor.getProvider().sendAndConfirm(new Transaction().add(ix));

  //   console.log("Transaction signature:", tx);
  // });


  // it("transfers tokens from one account to another", async () => {
  //   const destination = Keypair.generate();

  //   const ix = await solaClient.getTransferInstruction(new BN(10), destination.publicKey);

  //   const tx = await
  //     anchor.getProvider().sendAndConfirm(new Transaction().add(ix));;

  //   console.log("Transaction signature:", tx);
  // });


  // it("burns tokens from a sola", async () => {
  //   const amount = new BN(50);

  //   const ix = await solaClient.getBurnInstruction(amount);

  //   const tx = await
  //     anchor.getProvider().sendAndConfirm(new Transaction().add(ix));;

  //   console.log("Transaction signature:", tx);
  // });

  // it("deletes a sola", async () => {
  //   const ix = await solaClient.getDeleteInstruction();

  //   const tx = await
  //     anchor.getProvider().sendAndConfirm(new Transaction().add(ix));;

  //   console.log("Transaction signature:", tx);
  // });

  // Add more tests as needed
});