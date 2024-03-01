import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { ComputeBudgetProgram, Keypair, Transaction } from "@solana/web3.js";
import { assert } from "chai";
import { AnchorSola, BadgeProgram, ProfileProgram, wait } from "../src";
import * as pda from "../src/addresses";
import * as registry from "../src/registry";

describe("anchor_sola", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const wallet = anchor.Wallet.local();
  const defaultDispatcher = Keypair.generate();
  const program = anchor.workspace.AnchorSola as Program<AnchorSola>;

  const profileProgram = new ProfileProgram(program);
  let global: {
    counter: BN;
    classCounter: BN;
    owner: anchor.web3.PublicKey;
    chainid: BN;
    baseUri: string;
  };

  before("airdrop", async () => {
    const res = await program.provider.connection.requestAirdrop(
      wallet.publicKey,
      100
    );
    console.log("airdrop result:", res);
    const banlance = await program.provider.connection.getBalance(
      wallet.payer.publicKey
    );
    console.log("banlance:", banlance);
    await wait(500);
  });

  it("init a profile", async () => {
    const ix = await profileProgram.initializeeProfileGlobal(
      new BN(111),
      "https://example.com/my-sola.json",
      wallet.payer
    );

    console.log("Instruction:", ix);

    const tx = await anchor
      .getProvider()
      .sendAndConfirm(new Transaction().add(ix), [], { skipPreflight: true });

    console.log("Transaction signature:", tx);

    await wait(200);

    const res = await anchor
      .getProvider()
      .connection.getParsedTransaction(tx, { commitment: "confirmed" });

    console.log("Transaction res:", res);

    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    console.log("init global:", global);

    assert(global.chainid.eq(new anchor.BN(111)));
    assert(global.baseUri == "https://example.com/my-sola.json");
    assert(global.owner.equals(wallet.publicKey));
  });

  it("set profile creator", async () => {
    const ix = await profileProgram.setProfileCreator(
      true,
      wallet.payer,
      wallet.publicKey
    );

    console.log("Instruction:", ix);

    const tx = await anchor
      .getProvider()
      .sendAndConfirm(new Transaction().add(ix), [], { skipPreflight: true });

    console.log("Transaction signature:", tx);

    await wait(200);

    const res = await anchor
      .getProvider()
      .connection.getParsedTransaction(tx, { commitment: "confirmed" });

    console.log("Transaction res:", res);

    const isProfileCreator = await program.account.isProfileCreator.fetch(
      pda.IsProfileCreator(wallet.publicKey)[0]
    );
    console.log("isProfileCreator:", isProfileCreator);
    assert(isProfileCreator.isProfileCreator == true);
  });

  it("update a global", async () => {
    const ix = await profileProgram.updateProfileGlobal(
      new BN(777),
      "https://example.com/update.json",
      wallet.payer,
      wallet.publicKey
    );

    console.log("Instruction:", ix);

    const tx = await anchor
      .getProvider()
      .sendAndConfirm(new Transaction().add(ix), [], { skipPreflight: true });

    console.log("Transaction signature:", tx);

    await wait(200);

    const res = await anchor
      .getProvider()
      .connection.getParsedTransaction(tx, { commitment: "confirmed" });

    console.log("Transaction res:", res);

    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    console.log("update global:", global);
    assert(global.baseUri == "https://example.com/update.json");
    assert(global.chainid.eq(new anchor.BN(777)));
  });

  it("mint a group profile", async () => {
    const test_profile_owner = Keypair.generate();
    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    const profileId = global.counter;
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

    const ix = await profileProgram.mintGroupProfile(
      params,
      wallet.payer,
      test_profile_owner.publicKey
    );

    console.log("Instruction:", ix);

    const tx = await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }))
        .add(ix),
      [],
      { skipPreflight: true }
    );

    console.log("Transaction signature:", tx);

    await wait(200);

    const res = await anchor
      .getProvider()
      .connection.getParsedTransaction(tx, { commitment: "confirmed" });

    console.log("Transaction res:", res);

    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    console.log("update global:", global);
    assert(global.counter.eq(profileId.add(new anchor.BN(1))));
    const mint = new registry.Mint(
      pda.mintProfile(profileId)[0],
      test_profile_owner.publicKey
    );
    const profile = await program.account.solaProfile.fetch(
      pda.solaProfile(mint.masterMint)[0]
    );
    console.log("all profile:", profile);
    assert(profile.addressDefaultProfiles == null);
    assert(profile.masterMint.equals(mint.masterMint));
    assert(profile.masterEdition.equals(mint.masterEdition));
    assert(profile.masterMetadata.equals(mint.masterMetadata));
    assert(new BN(profile.profileId, 10, "be").eq(profileId));
  });

  it("mint a default profile", async () => {
    const test_profile_owner = Keypair.generate();
    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    const profileId = global.counter;
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

    const ix = await profileProgram.mintDefaultProfile(
      params,
      wallet.payer,
      test_profile_owner.publicKey
    );

    console.log("Instruction:", ix);

    const tx = await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }))
        .add(ix),
      [],
      { skipPreflight: true }
    );

    console.log("Transaction signature:", tx);

    await wait(200);

    const res = await anchor
      .getProvider()
      .connection.getParsedTransaction(tx, { commitment: "confirmed" });

    console.log("Transaction res:", res);

    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    console.log("update global:", global);
    assert(global.counter.eq(profileId.add(new anchor.BN(1))));
    const mint = new registry.Mint(
      pda.mintProfile(profileId)[0],
      test_profile_owner.publicKey
    );
    const profile = await program.account.solaProfile.fetch(
      pda.solaProfile(mint.masterMint)[0]
    );
    console.log("all profile:", profile);
    assert(
      profile.addressDefaultProfiles.equals(
        pda.solaDefaultProfiles(test_profile_owner.publicKey)[0]
      )
    );
    assert(profile.masterMint.equals(mint.masterMint));
    assert(profile.masterEdition.equals(mint.masterEdition));
    assert(profile.masterMetadata.equals(mint.masterMetadata));
    assert(new BN(profile.profileId, 10, "be").eq(profileId));
  });

  it("set default dispatcher", async () => {
    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );

    const profileId = global.counter;
    const params = {
      name: "MyDispatcher",
      creators: [
        {
          address: wallet.publicKey,
          share: 100,
        },
      ],
      curator: wallet.publicKey,
      sellerFeeBasisPoints: 0,
      symbol: "MSOL",
      uri: "https://example.com/my-dispatcher.json",
      isMutable: true,
    };

    const mintIx = await profileProgram.mintDefaultProfile(
      params,
      wallet.payer,
      defaultDispatcher.publicKey
    );

    const setDefaultDispatcherIx = await profileProgram.setDefaultDispatcher(
      wallet.payer,
      defaultDispatcher.publicKey
    );

    const tx = await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(mintIx)
        .add(setDefaultDispatcherIx),
      [],
      { skipPreflight: true }
    );

    console.log("Transaction signature:", tx);

    await wait(200);

    const res = await anchor
      .getProvider()
      .connection.getParsedTransaction(tx, { commitment: "confirmed" });

    console.log("Transaction res:", res);

    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    console.log("update global:", global);
    assert(global.counter.eq(profileId.add(new anchor.BN(1))));
    const mint = new registry.Mint(
      pda.mintProfile(profileId)[0],
      defaultDispatcher.publicKey
    );
    const profile = await program.account.solaProfile.fetch(
      pda.solaProfile(mint.masterMint)[0]
    );
    console.log("all profile:", profile);
    assert(
      profile.addressDefaultProfiles.equals(
        pda.solaDefaultProfiles(defaultDispatcher.publicKey)[0]
      )
    );
    assert(profile.masterMint.equals(mint.masterMint));
    assert(profile.masterEdition.equals(mint.masterEdition));
    assert(profile.masterMetadata.equals(mint.masterMetadata));
    assert(new BN(profile.profileId, 10, "be").eq(profileId));
    const getDefaultDispatcher = await program.account.dispatcher.fetch(
      pda.defaultDispatcher()[0]
    );
    assert(getDefaultDispatcher.dispatcher.equals(defaultDispatcher.publicKey));
  });

  it("burn a profile", async () => {
    const test_profile_owner = Keypair.generate();
    const params = {
      name: "MyTestProfile",
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

    const ix = await profileProgram.mintDefaultProfile(
      params,
      wallet.payer,
      test_profile_owner.publicKey
    );

    console.log("Minting profile instruction:", ix);

    const tx = await anchor
      .getProvider()
      .sendAndConfirm(
        new Transaction()
          .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }))
          .add(ix),
        [],
        { skipPreflight: true }
      );

    console.log("Minting transaction signature:", tx);

    await wait(200);

    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    const profileId = global.counter.sub(new BN(1));
    const burnIx = await profileProgram.burnProfile(
      profileId,
      test_profile_owner
    );

    console.log("Burning profile instruction:", burnIx);

    const burnTx = await anchor
      .getProvider()
      .sendAndConfirm(
        new Transaction()
          .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }))
          .add(burnIx),
        [test_profile_owner],
        { skipPreflight: true }
      );

    console.log("Burning transaction signature:", burnTx);

    await wait(200);

    // Verify that the profile was burned

    try {
      await program.account.solaProfile.fetch(
        pda.solaProfile(pda.mintProfile(profileId)[0])[0]
      );
    } catch (error) {
      console.log("Profile after burn:", error);
    }
  });

  it("set dispatcher", async () => {
    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );

    const dispatcher = Keypair.generate();
    const profileId = global.counter;
    const params = {
      name: "MyDispatcher",
      creators: [
        {
          address: wallet.publicKey,
          share: 100,
        },
      ],
      curator: wallet.publicKey,
      sellerFeeBasisPoints: 0,
      symbol: "MSOL",
      uri: "https://example.com/my-dispatcher.json",
      isMutable: true,
    };

    const mintIx = await profileProgram.mintDefaultProfile(
      params,
      wallet.payer,
      dispatcher.publicKey
    );

    const setDispatcherIx = await profileProgram.setDispatcher(
      profileId,
      wallet.payer,
      dispatcher.publicKey,
      dispatcher
    );

    console.log("setDispatcherIx:", setDispatcherIx);

    const tx = await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(mintIx)
        .add(setDispatcherIx),
      // TODO: 这里不知道为什么，需要单独加签名，我感觉可能是因为按照第一个mintIx的签名来处理的，所以签名失败
      [wallet.payer, dispatcher],
      { skipPreflight: true }
    );

    console.log("Transaction signature:", tx);

    await wait(200);

    const res = await anchor
      .getProvider()
      .connection.getParsedTransaction(tx, { commitment: "confirmed" });

    console.log("Transaction res:", res);

    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    console.log("update global:", global);
    assert(global.counter.eq(profileId.add(new anchor.BN(1))));
    const mint = new registry.Mint(
      pda.mintProfile(profileId)[0],
      dispatcher.publicKey
    );
    const profile = await program.account.solaProfile.fetch(
      pda.solaProfile(mint.masterMint)[0]
    );
    console.log("all profile:", profile);
    assert(
      profile.addressDefaultProfiles.equals(
        pda.solaDefaultProfiles(dispatcher.publicKey)[0]
      )
    );
    assert(profile.masterMint.equals(mint.masterMint));
    assert(profile.masterEdition.equals(mint.masterEdition));
    assert(profile.masterMetadata.equals(mint.masterMetadata));
    assert(new BN(profile.profileId, 10, "be").eq(profileId));

    const userDispatcher = await program.account.dispatcher.fetch(
      pda.dispatcher(mint.masterMint)[0]
    );
    assert(userDispatcher.dispatcher.equals(dispatcher.publicKey));
  });

  it("set group controller", async () => {
    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );

    const dispatcher = Keypair.generate();
    const owner = Keypair.generate();

    const profileId = global.counter;
    const params = {
      name: "MyDispatcher",
      creators: [
        {
          address: wallet.publicKey,
          share: 100,
        },
      ],
      curator: wallet.publicKey,
      sellerFeeBasisPoints: 0,
      symbol: "MSOL",
      uri: "https://example.com/my-dispatcher.json",
      isMutable: true,
    };

    const mintIx = await profileProgram.mintDefaultProfile(
      params,
      wallet.payer,
      owner.publicKey
    );

    const tx = await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(mintIx),
      // TODO: 这里不知道为什么，需要单独加签名，我感觉可能是因为按照第一个mintIx的签名来处理的，所以签名失败
      [wallet.payer],
      { skipPreflight: true }
    );

    console.log("Transaction signature:", tx);

    await wait(200);

    const res = await anchor
      .getProvider()
      .connection.getParsedTransaction(tx, { commitment: "confirmed" });

    console.log("Transaction res:", res);

    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    console.log("update global:", global);
    assert(global.counter.eq(profileId.add(new anchor.BN(1))));
    const mint = new registry.Mint(
      pda.mintProfile(profileId)[0],
      owner.publicKey
    );
    const profile = await program.account.solaProfile.fetch(
      pda.solaProfile(mint.masterMint)[0]
    );
    console.log("all profile:", profile);
    assert(
      profile.addressDefaultProfiles.equals(
        pda.solaDefaultProfiles(owner.publicKey)[0]
      )
    );
    assert(profile.masterMint.equals(mint.masterMint));
    assert(profile.masterEdition.equals(mint.masterEdition));
    assert(profile.masterMetadata.equals(mint.masterMetadata));
    assert(new BN(profile.profileId, 10, "be").eq(profileId));

    console.log("will test default dispatcher can set group controller.");

    const otherController = Keypair.generate();

    const defaultDispatcherCanSetGroupControllerIx =
      await profileProgram.setGroupController(
        profileId,
        wallet.payer,
        otherController.publicKey,
        {
          isIssuer: true,
          isMember: false,
          isManager: true,
        },
        defaultDispatcher
      );

    await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(defaultDispatcherCanSetGroupControllerIx),
      [wallet.payer, defaultDispatcher],
      { skipPreflight: true }
    );

    await wait(200);

    const fetchOtherController = await program.account.groupController.fetch(
      pda.groupController(mint.masterMint, otherController.publicKey)[0]
    );

    assert(fetchOtherController.isIssuer == true);
    assert(fetchOtherController.isManager == true);
    assert(fetchOtherController.isMember == false);

    const setDispatcherIx = await profileProgram.setDispatcher(
      profileId,
      wallet.payer,
      dispatcher.publicKey,
      owner
    );

    console.log("setDispatcherIx:", setDispatcherIx);

    await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(setDispatcherIx),
      // TODO: 这里不知道为什么，需要单独加签名，我感觉可能是因为按照第一个mintIx的签名来处理的，所以签名失败
      [wallet.payer, owner],
      { skipPreflight: true }
    );

    await wait(200);

    const userDispatcher = await program.account.dispatcher.fetch(
      pda.dispatcher(mint.masterMint)[0]
    );
    assert(userDispatcher.dispatcher.equals(dispatcher.publicKey));

    console.log("will test dispatcher can set group controller.");

    const controller = Keypair.generate();

    const dispatcherCanSetGroupControllerIx =
      await profileProgram.setGroupController(
        profileId,
        wallet.payer,
        controller.publicKey,
        {
          isIssuer: true,
          isMember: false,
          isManager: true,
        },
        dispatcher
      );

    await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(dispatcherCanSetGroupControllerIx),
      [wallet.payer, dispatcher],
      { skipPreflight: true }
    );

    await wait(200);

    const fetchController = await program.account.groupController.fetch(
      pda.groupController(mint.masterMint, controller.publicKey)[0]
    );

    assert(fetchController.isIssuer == true);
    assert(fetchController.isManager == true);
    assert(fetchController.isMember == false);

    console.log("will test owner can set group controller.");

    const newController = Keypair.generate();
    const ownerCanSetGroupControllerIx =
      await profileProgram.setGroupController(
        profileId,
        wallet.payer,
        newController.publicKey,
        {
          isIssuer: true,
          isMember: false,
          isManager: true,
        },
        owner
      );

    await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(ownerCanSetGroupControllerIx),
      [wallet.payer, owner],
      { skipPreflight: true }
    );

    await wait(200);

    const fetchNewController = await program.account.groupController.fetch(
      pda.groupController(mint.masterMint, newController.publicKey)[0]
    );

    assert(fetchNewController.isIssuer == true);
    assert(fetchNewController.isManager == true);
    assert(fetchNewController.isMember == false);

    console.log("will test default dispatcher can't set group controller.");

    const againController = Keypair.generate();

    const againDefaultDispatcherCanSetGroupControllerIx =
      await profileProgram.setGroupController(
        profileId,
        wallet.payer,
        againController.publicKey,
        {
          isIssuer: true,
          isMember: false,
          isManager: true,
        },
        wallet.payer
      );

    try {
      await anchor.getProvider().sendAndConfirm(
        new Transaction()
          // 加钱！！！
          .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
          .add(againDefaultDispatcherCanSetGroupControllerIx),
        [wallet.payer],
        { skipPreflight: true }
      );
    } catch (error) {
      console.log("Default dispatcher no perssion:", error);
    }
  });

  it("registers a class", async () => {
    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    const classId = global.classCounter;
    const profileId = global.counter;
    const owner = Keypair.generate();
    const mintControllerIx = await profileProgram.mintGroupProfile(
      {
        name: "test class controller",
        symbol: "TCC",
        uri: "www.example.tcc",
        isMutable: true,
        creators: [
          {
            address: wallet.publicKey,
            share: 100,
          },
        ],
        sellerFeeBasisPoints: 0,
      },
      wallet.payer,
      owner.publicKey
    );
    const registerIx = await profileProgram.register(
      classId,
      profileId,
      {
        fungible: false,
        transferable: true,
        revocable: false,
        address: owner.publicKey,
        schema: "my test badge schema",
      },
      wallet.payer
    );
    await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(mintControllerIx)
        .add(registerIx),
      [wallet.payer],
      { skipPreflight: true }
    );

    await wait(200);
    const tokenClass = await program.account.tokenClass.fetch(
      pda.tokenClass(classId)[0]
    );
    assert(tokenClass.address.equals(owner.publicKey));
    assert(tokenClass.schema == "my test badge schema");
    assert(tokenClass.controller.eq(profileId));
    assert(tokenClass.fungible == false);
    assert(tokenClass.transferable == true);
    assert(tokenClass.revocable == false);

    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    assert(global.classCounter.eq(classId.add(new anchor.BN(1))));
  });

  it("set token class state", async () => {
    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    const classId = global.classCounter;
    const profileId = global.counter;
    const owner = Keypair.generate();
    const mintControllerIx = await profileProgram.mintGroupProfile(
      {
        name: "test class controller",
        symbol: "TCC",
        uri: "www.example.tcc",
        isMutable: true,
        creators: [
          {
            address: wallet.publicKey,
            share: 100,
          },
        ],
        sellerFeeBasisPoints: 0,
      },
      wallet.payer,
      owner.publicKey
    );
    const registerIx = await profileProgram.register(
      classId,
      profileId,
      {
        fungible: false,
        transferable: true,
        revocable: false,
        address: owner.publicKey,
        schema: "my test badge schema",
      },
      wallet.payer
    );
    await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(mintControllerIx)
        .add(registerIx),
      [wallet.payer],
      { skipPreflight: true }
    );

    await wait(200);
    const tokenClass = await program.account.tokenClass.fetch(
      pda.tokenClass(classId)[0]
    );
    assert(tokenClass.address.equals(owner.publicKey));
    assert(tokenClass.schema == "my test badge schema");
    assert(tokenClass.controller.eq(profileId));
    assert(tokenClass.fungible == false);
    assert(tokenClass.transferable == true);
    assert(tokenClass.revocable == false);

    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    assert(global.classCounter.eq(classId.add(new anchor.BN(1))));

    console.log("owner set token class state");

    const controller = Keypair.generate();
    const setTokenClassStateIx = await profileProgram.setTokenClassState(
      classId,
      { isIssuer: true, isConsumer: true },
      wallet.payer,
      controller.publicKey,
      owner
    );

    await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(setTokenClassStateIx),
      [wallet.payer, owner],
      { skipPreflight: true }
    );

    const ownerSetTokenClassState = await program.account.tokenClassState.fetch(
      pda.tokenClassState(pda.tokenClass(classId)[0], controller.publicKey)[0]
    );

    assert(ownerSetTokenClassState.isIssuer == true);
    assert(ownerSetTokenClassState.isConsumer == true);

    console.log("default dispatcher can set token class state");
    const dispatcherSetTokenClassStateIx =
      await profileProgram.setTokenClassState(
        classId,
        { isIssuer: false, isConsumer: true },
        wallet.payer,
        controller.publicKey,
        defaultDispatcher
      );

    await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(dispatcherSetTokenClassStateIx),
      [wallet.payer, defaultDispatcher],
      { skipPreflight: true }
    );

    const dispatcherSetTokenClassState =
      await program.account.tokenClassState.fetch(
        pda.tokenClassState(pda.tokenClass(classId)[0], controller.publicKey)[0]
      );

    assert(dispatcherSetTokenClassState.isIssuer == false);
    assert(dispatcherSetTokenClassState.isConsumer == true);
  });

  it("set class generic", async () => {
    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    const classId = global.classCounter;
    const profileId = global.counter;
    const owner = Keypair.generate();
    const mintControllerIx = await profileProgram.mintGroupProfile(
      {
        name: "test class controller",
        symbol: "TCC",
        uri: "www.example.tcc",
        isMutable: true,
        creators: [
          {
            address: wallet.publicKey,
            share: 100,
          },
        ],
        sellerFeeBasisPoints: 0,
      },
      wallet.payer,
      owner.publicKey
    );
    const registerIx = await profileProgram.register(
      classId,
      profileId,
      {
        fungible: false,
        transferable: true,
        revocable: false,
        address: owner.publicKey,
        schema: "my test badge schema",
      },
      wallet.payer
    );
    await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(mintControllerIx)
        .add(registerIx),
      [wallet.payer],
      { skipPreflight: true }
    );

    await wait(200);
    const tokenClass = await program.account.tokenClass.fetch(
      pda.tokenClass(classId)[0]
    );
    assert(tokenClass.address.equals(owner.publicKey));
    assert(tokenClass.schema == "my test badge schema");
    assert(tokenClass.controller.eq(profileId));
    assert(tokenClass.fungible == false);
    assert(tokenClass.transferable == true);
    assert(tokenClass.revocable == false);

    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    assert(global.classCounter.eq(classId.add(new anchor.BN(1))));

    console.log("owner set class generic");

    const setClassGenericIx = await profileProgram.setClassGeneric(
      classId,
      { isGenericBadgeClass: true, isLineageBadgeClass: true },
      wallet.payer,
      owner
    );

    await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(setClassGenericIx),
      [wallet.payer, owner],
      { skipPreflight: true }
    );

    const ownerSetClassGeneric = await program.account.classGeneric.fetch(
      pda.classGeneric(pda.tokenClass(classId)[0])[0]
    );

    assert(ownerSetClassGeneric.isGenericBadgeClass == true);
    assert(ownerSetClassGeneric.isLineageBadgeClass == true);

    console.log("default dispatcher can set class generic");
    const dispatcherSetClassGenericIx = await profileProgram.setClassGeneric(
      classId,
      { isGenericBadgeClass: false, isLineageBadgeClass: true },
      wallet.payer,
      defaultDispatcher
    );

    await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(dispatcherSetClassGenericIx),
      [wallet.payer, defaultDispatcher],
      { skipPreflight: true }
    );

    const dispatcherSetClassGeneric = await program.account.classGeneric.fetch(
      pda.classGeneric(pda.tokenClass(classId)[0])[0]
    );

    assert(dispatcherSetClassGeneric.isGenericBadgeClass == false);
    assert(dispatcherSetClassGeneric.isLineageBadgeClass == true);

    console.log("group manager can set class generic");

    const controller = Keypair.generate();
    const setGroupControllerIx = await profileProgram.setGroupController(
      profileId,
      wallet.payer,
      controller.publicKey,
      { isManager: true, isIssuer: false, isMember: false },
      owner
    );
    const groupManagerSetClassGenericIx = await profileProgram.setClassGeneric(
      classId,
      { isGenericBadgeClass: true, isLineageBadgeClass: false },
      wallet.payer,
      controller
    );

    await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(setGroupControllerIx)
        .add(groupManagerSetClassGenericIx),
      [wallet.payer, owner, controller],
      { skipPreflight: true }
    );

    const groupManagerSetClassGeneric =
      await program.account.classGeneric.fetch(
        pda.classGeneric(pda.tokenClass(classId)[0])[0]
      );

    assert(groupManagerSetClassGeneric.isGenericBadgeClass == true);
    assert(groupManagerSetClassGeneric.isLineageBadgeClass == false);
  });

  const badgeProgram = new BadgeProgram(program);
  const badgeOwner = Keypair.generate();
  let badgeGlobal: {
    owner: anchor.web3.PublicKey;
    baseUri: string;
    counter: anchor.BN;
  };

  it("init badge", async () => {
    const ix = await badgeProgram.initializeeBadgeGlobal(
      "https://example.com/my-badge.json",
      wallet.payer,
      badgeOwner.publicKey
    );

    await anchor
      .getProvider()
      .sendAndConfirm(new Transaction().add(ix), [], { skipPreflight: true });

    await wait(200);

    badgeGlobal = await program.account.badgeGlobal.fetch(pda.badgeGlobal()[0]);

    console.log("init badge global:", global);

    assert(badgeGlobal.baseUri == "https://example.com/my-badge.json");
    assert(badgeGlobal.owner.equals(badgeOwner.publicKey));
    assert(badgeGlobal.counter.eq(new anchor.BN(1)));
  });

  it("mint badge", async () => {
    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    const classId = global.classCounter;
    const profileId = global.counter;
    const tokenClassOwner = Keypair.generate();
    const mintControllerIx = await profileProgram.mintGroupProfile(
      {
        name: "test class controller",
        symbol: "TCC",
        uri: "www.example.tcc",
        isMutable: true,
        creators: [
          {
            address: wallet.publicKey,
            share: 100,
          },
        ],
        sellerFeeBasisPoints: 0,
      },
      wallet.payer,
      tokenClassOwner.publicKey
    );
    const registerIx = await profileProgram.register(
      classId,
      profileId,
      {
        fungible: false,
        transferable: true,
        revocable: false,
        address: tokenClassOwner.publicKey,
        schema: "my test badge schema",
      },
      wallet.payer
    );
    await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(mintControllerIx)
        .add(registerIx),
      [wallet.payer],
      { skipPreflight: true }
    );

    await wait(200);
    const tokenClass = await program.account.tokenClass.fetch(
      pda.tokenClass(classId)[0]
    );
    assert(tokenClass.address.equals(tokenClassOwner.publicKey));
    assert(tokenClass.schema == "my test badge schema");
    assert(tokenClass.controller.eq(profileId));
    assert(tokenClass.fungible == false);
    assert(tokenClass.transferable == true);
    assert(tokenClass.revocable == false);

    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    assert(global.classCounter.eq(classId.add(new anchor.BN(1))));

    console.log("mint transferable badge without data");

    const myBadgeOwner = Keypair.generate();
    badgeGlobal = await program.account.badgeGlobal.fetch(pda.badgeGlobal()[0]);

    const badgeId = badgeGlobal.counter;
    const mintBadgeIx = await badgeProgram.mintBadge(
      classId,
      {
        name: "testBadge",
        // TODO:
        // 不知道为什么，设置为空的时候，anchor识别不到整个instructions
        creators: [
          {
            address: wallet.publicKey,
            share: 100,
          },
        ],
        sellerFeeBasisPoints: 0,
        symbol: "hi",
        uri: "www.example.badge",
        isMutable: true,
        weights: new anchor.BN(0),
        schema: "testSchema",
      },
      wallet.payer,
      myBadgeOwner.publicKey,
      tokenClassOwner
    );

    await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(mintBadgeIx),
      [wallet.payer, tokenClassOwner],
      { skipPreflight: true }
    );

    badgeGlobal = await program.account.badgeGlobal.fetch(pda.badgeGlobal()[0]);
    assert(badgeGlobal.counter.eq(badgeId.add(new anchor.BN(1))));

    const badgeMint = new registry.Mint(
      pda.mintBadge(badgeId)[0],
      myBadgeOwner.publicKey
    );
    const badgeState = await program.account.badgeState.fetch(
      pda.badgeState(badgeMint.masterMint)[0]
    );

    assert(new BN(badgeState.badgeId, 10, "be").eq(badgeId));
    assert(badgeState.masterEdition.equals(badgeMint.masterEdition));
    assert(badgeState.masterMint.equals(badgeMint.masterMint));
    assert(badgeState.masterMetadata.equals(badgeMint.masterMetadata));
    assert(badgeState.weights.eq(new anchor.BN(0)));
    assert(badgeState.metatable.eq(classId));
    assert(badgeState.tokenSchema == "testSchema");
  });

  it("mint nonTransferable badge", async () => {
    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    const classId = global.classCounter;
    const profileId = global.counter;
    const tokenClassOwner = Keypair.generate();
    const mintControllerIx = await profileProgram.mintGroupProfile(
      {
        name: "test class controller",
        symbol: "TCC",
        uri: "www.example.tcc",
        isMutable: true,
        creators: [
          {
            address: wallet.publicKey,
            share: 100,
          },
        ],
        sellerFeeBasisPoints: 0,
      },
      wallet.payer,
      tokenClassOwner.publicKey
    );
    const registerIx = await profileProgram.register(
      classId,
      profileId,
      {
        fungible: false,
        transferable: false,
        revocable: false,
        address: tokenClassOwner.publicKey,
        schema: "my test badge schema",
      },
      wallet.payer
    );
    await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(mintControllerIx)
        .add(registerIx),
      [wallet.payer],
      { skipPreflight: true }
    );

    await wait(200);
    const tokenClass = await program.account.tokenClass.fetch(
      pda.tokenClass(classId)[0]
    );
    assert(tokenClass.address.equals(tokenClassOwner.publicKey));
    assert(tokenClass.schema == "my test badge schema");
    assert(tokenClass.controller.eq(profileId));
    assert(tokenClass.fungible == false);
    assert(tokenClass.transferable == false);
    assert(tokenClass.revocable == false);

    global = await program.account.solaProfileGlobal.fetch(
      pda.solaProfileGlobal()[0]
    );
    assert(global.classCounter.eq(classId.add(new anchor.BN(1))));

    console.log("mint transferable badge without data");

    const myBadgeOwner = Keypair.generate();
    badgeGlobal = await program.account.badgeGlobal.fetch(pda.badgeGlobal()[0]);

    const badgeId = badgeGlobal.counter;
    const mintBadgeIx = await badgeProgram.mintBadge(
      classId,
      {
        name: "testBadge",
        // TODO:
        // 不知道为什么，设置为空的时候，anchor识别不到整个instructions
        creators: [
          {
            address: wallet.publicKey,
            share: 100,
          },
        ],
        sellerFeeBasisPoints: 0,
        symbol: "hi",
        uri: "www.example.badge",
        isMutable: true,
        weights: new anchor.BN(0),
        schema: "testSchema",
      },
      wallet.payer,
      myBadgeOwner.publicKey,
      tokenClassOwner
    );

    await anchor.getProvider().sendAndConfirm(
      new Transaction()
        // 加钱！！！
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
        .add(mintBadgeIx),
      [wallet.payer, tokenClassOwner],
      { skipPreflight: true }
    );

    badgeGlobal = await program.account.badgeGlobal.fetch(pda.badgeGlobal()[0]);
    assert(badgeGlobal.counter.eq(badgeId.add(new anchor.BN(1))));

    const badgeMint = new registry.Mint(
      pda.mintBadge(badgeId)[0],
      myBadgeOwner.publicKey
    );
    const badgeState = await program.account.badgeState.fetch(
      pda.badgeState(badgeMint.masterMint)[0]
    );

    assert(new BN(badgeState.badgeId, 10, "be").eq(badgeId));
    assert(badgeState.masterEdition.equals(badgeMint.masterEdition));
    assert(badgeState.masterMint.equals(badgeMint.masterMint));
    assert(badgeState.masterMetadata.equals(badgeMint.masterMetadata));
    assert(badgeState.weights.eq(new anchor.BN(0)));
    assert(badgeState.metatable.eq(classId));
    assert(badgeState.tokenSchema == "testSchema");
  });

  // Add more tests as needed
});
