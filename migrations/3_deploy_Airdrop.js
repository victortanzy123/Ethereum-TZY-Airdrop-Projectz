const TZYTokenABI = artifacts.require("TZYToken.sol");
const AirdropABI = artifacts.require("Airdrop.sol");

require("dotenv").config();

const { time } = require("@openzeppelin/test-helpers");

const THREE_DAYS_DURATION = time.duration.days(3);
console.log(THREE_DAYS_DURATION.toString());

module.exports = async function (deployer, network, addresses) {
  console.log(addresses);
  const adminAddress =
    network === "bsc" ? process.env.PUBLIC_KEY : process.env.PUBLIC_KEY;

  //   await deployer.deploy(TZYTokenABI)
  // Done in 2_deploy_TZYTokenContractOnly
  const TZYTokenContract = await TZYTokenABI.deployed();

  await deployer.deploy(
    AirdropABI,
    addresses[0],
    TZYTokenContract.address,
    THREE_DAYS_DURATION
  );

  const AirdropContract = await AirdropABI.deployed();
  await TZYTokenContract.transfer(
    AirdropContract.address,
    web3.utils.toWei("10000")
  );

  console.log("AIRDROP DEPLOYYEEEDDDDDD");
};
