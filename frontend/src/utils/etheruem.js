import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import Airdrop from "../../../build/contracts/Airdrop.json";

require("dotenv").config();

const networks = {
  56: "Binance Smart Chain Mainnet",
  97: "Binance Smart Chain Testnet",
  5777: "Local Development Blockchain",
  4: "Ethereum Rinkeby Testnet",
  1: "Ethereum Live Mainnet",
};

const getBlockchain = () => {
  new Promise(async (resolve, reject) => {
    // Check for provider
    const provider = await detectEthereumProvider();

    if (provider) {
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      const networkId = await provider.request({ method: "net_version" });

      if (networkId !== process.env.NEXT_PUBLIC_NETWORK_ID) {
        const targetNetwork = networks[process.env.NEXT_PUBLIC_NETWORK_ID];
        reject(`Wrong network, please switch to ${targetNetwork}`);
        return;
      }

      // Instantiate the provider to instantiate the contract with the ABI & Address:
      const web3 = new Web3(provider);
      const airdrop = new web3.eth.Contract(
        Airdrop.abi,
        Airdrop.networks[networkId].address
      );

      // Once success - resolve the promise:
      resolve({ airdrop, accounts });
      return;
    }

    // If no provider detected, ask user to install:
    reject("Install Metamask!");
  });
};

export default getBlockchain;
