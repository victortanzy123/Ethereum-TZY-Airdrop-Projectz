const { assert } = require("chai");
const chai = require("chai");

const { expect } = chai;

const TokenABI = artifacts.require("TZYToken.sol");

contract("TZYToken", (accounts) => {
  let TZYTokenContract;
  const [adminMinter, _] = accounts;
  const TOTAL_SUPPLY_OF_TZYTOKEN = web3.utils.toWei("1000000");

  beforeEach(async () => {
    TZYTokenContract = await TokenABI.new();
    // console.log("TZYTokenContract: ", TZYTokenContract);
  });

  it("Should give admin the total supply", async () => {
    const totalSupply = await TZYTokenContract.totalSupply();
    expect(totalSupply.toString()).to.be.equal(
      TOTAL_SUPPLY_OF_TZYTOKEN.toString()
    );

    const balanceOfAdmin = await TZYTokenContract.balanceOf(adminMinter);
    expect(balanceOfAdmin.toString()).to.be.equal(
      TOTAL_SUPPLY_OF_TZYTOKEN.toString()
    );
  });
});
