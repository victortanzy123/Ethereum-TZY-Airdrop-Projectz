const TZYTokenABI = artifacts.require("TZYToken.sol");

module.exports = function (deployer) {
  deployer.deploy(TZYTokenABI);
};
