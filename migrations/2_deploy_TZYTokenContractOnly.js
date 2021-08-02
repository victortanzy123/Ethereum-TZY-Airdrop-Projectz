const TZYTokenABI = artifacts.require("TZYToken.sol");

module.exports = async function (deployer) {
  await deployer.deploy(TZYTokenABI);
};
