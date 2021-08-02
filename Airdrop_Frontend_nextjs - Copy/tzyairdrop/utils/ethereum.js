import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import Airdrop from "./Build/Airdrop.json";

const networks = {
  56: "Binance Smart Chain Mainnet",
  97: "Binance Smart Chain Testnet",
  5777: "Local Development Blockchain",
  4: "Ethereum Rinkeby Testnet",
  1: "Ethereum Live Mainnet",
};

const getBlockchain = () =>
  new Promise(async (resolve, reject) => {
    // Check for provider
    const provider = await detectEthereumProvider();

    if (provider) {
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      const networkId = await provider.request({ method: "net_version" });
      console.log(networkId);

      // Connect to bscTestnet:
      if (networkId !== "97") {
        const targetNetwork = networks[97];
        reject(`Wrong network, please switch to ${targetNetwork}`);
        return;
      }

      // Instantiate the provider to instantiate the contract with the ABI & Address:
      const web3 = new Web3(provider);
      const airdrop = new web3.eth.Contract(
        Airdrop.abi,
        Airdrop.networks[networkId].address
      );

      console.log(airdrop);
      console.log(accounts);

      // Once success - resolve the promise:
      resolve({ airdrop, accounts });
      console.log("i resolved");
      return { airdrop, accounts };
    }

    // If no provider detected, ask user to install:
    reject("Install Metamask!");
  });

export default getBlockchain;
