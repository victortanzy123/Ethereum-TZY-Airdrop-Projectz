require("dotenv").config();

const {
  expectRevert,
  time,
  constants,
  balance,
} = require("@openzeppelin/test-helpers");

const chai = require("chai");
const { expect } = chai;

// Contract ABI:
const AirDropABI = artifacts.require("Airdrop.sol");
const TZYTokenABI = artifacts.require("TZYToken.sol");

// Time Prefixes:
const THREE_DAYS = time.duration.days(3);
console.log("THREE_DAYS: ", THREE_DAYS);
const FIVE_DAYS = time.duration.days(5);

// Test Cases:
contract("Airdrop DAO", (accounts) => {
  let TZYTokenContract, AirdropContract;

  const [admin, OGreceipient, _] = accounts;
  // console.log("admin account: ", accounts);
  const TOTAL_SUPPLY_OF_TZYTOKEN = web3.utils.toWei("1000000");
  const AIRDROP_SUPPLY = web3.utils.toWei("100000");
  console.log("AIRDROP_SUPPLY:", AIRDROP_SUPPLY);

  console.log(process.env.PUBLIC_KEY);

  beforeEach(async () => {
    // Instantiate both contracts live first:
    TZYTokenContract = await TZYTokenABI.new();
    AirdropContract = await AirDropABI.new(
      process.env.PUBLIC_KEY,
      TZYTokenContract.address,
      THREE_DAYS
    );

    // Transfer the minted token to the Airdrop Contract from the admin:
    await TZYTokenContract.transfer(AirdropContract.address, AIRDROP_SUPPLY);
  });

  // Function to create signature (not from the accounts given) which returns signature, receipientAddress & amount:
  const createSignatureOfReceipient = (amountToAirdrop, params) => {
    const { address: slatedReceipient } = web3.eth.accounts.create();

    // Adding the new K-V pairs
    params = {
      receipient: slatedReceipient,
      amount: amountToAirdrop,
      ...params,
    };

    // console.log("params: ", params);

    const message = web3.utils
      .soliditySha3(
        { t: "address", v: params.receipient },
        { t: "uint256", v: params.amount }
      )
      .toString("hex");

    const { signature } = web3.eth.accounts.sign(
      message,
      process.env.PRIVATE_KEY
    );

    return { signature, receipient: params.receipient, amount: params.amount };
  };

  // Test Cases:

  it("Should airdrop to receipient", async () => {
    // Creating signature from the backend SIMULATION:
    const { signature, receipient, amount } = createSignatureOfReceipient(100);

    // Performing the airdrop:
    await AirdropContract.claimAirdropTokens(receipient, amount, signature);

    const balanceOfReceipient = await TZYTokenContract.balanceOf(receipient);

    expect(balanceOfReceipient).to.be.bignumber.equal(web3.utils.toBN(amount));
  });

  it("Should NOT airdrop twice for the same receipient (same address)", async () => {
    const { signature, receipient, amount } = createSignatureOfReceipient(100);

    // ClaimAirDropToken called twice consecutively
    await AirdropContract.claimAirdropTokens(receipient, amount, signature),
      await expectRevert(
        AirdropContract.claimAirdropTokens(receipient, amount, signature),
        "received Airdrop already"
      );
  });

  it("Should NOT airdrop if it is an INVALID Receipient", async () => {
    const { signature, amount } = createSignatureOfReceipient(100);

    const { address: InvalidReceipient } = web3.eth.accounts.create();

    await expectRevert(
      AirdropContract.claimAirdropTokens(InvalidReceipient, amount, signature),
      "wrong signature"
    );
  });

  it("Should NOT airdrop if wrong amount is requested.", async () => {
    const { signature, receipient, amount } = createSignatureOfReceipient(100);

    const wrongAmount = "101";

    await expectRevert(
      AirdropContract.claimAirdropTokens(receipient, wrongAmount, signature),
      "wrong signature"
    );
  });

  it("Should NOT airdrop if wrong signature is submitted.", async () => {
    const { receipient, amount } = createSignatureOfReceipient(100);

    const wrongSignatureObject = createSignatureOfReceipient(100);

    await expectRevert(
      AirdropContract.claimAirdropTokens(
        receipient,
        amount,
        wrongSignatureObject.signature
      ),
      "wrong signature"
    );
  });

  it("Should NOT airdrop after the deadline", async () => {
    // Since only 3 days is given for the Airdrop to be claimed:
    await time.increase(FIVE_DAYS);

    const { receipient, amount, signature } = createSignatureOfReceipient(100);

    await expectRevert(
      AirdropContract.claimAirdropTokens(receipient, amount, signature),
      "Airdrop contract expired"
    );
  });

  it("Should NOT airdrop if amount requested exceeds Maximum amount of tokens for airdrop", async () => {
    const exceeededAmount = web3.utils.toWei("1000001");
    const { receipient, amount, signature } =
      createSignatureOfReceipient(exceeededAmount);

    await expectRevert(
      AirdropContract.claimAirdropTokens(receipient, amount, signature),
      "insufficient tokens"
    );
  });
});
