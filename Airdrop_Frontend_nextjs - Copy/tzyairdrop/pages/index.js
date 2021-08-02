import React, { useEffect, useState } from "react";

// Backend API Helpers:
import Head from "next/head";
import axios from "axios";

// web3 Library / Metamask:
import Web3 from "web3";
import getBlockchain from "../utils/ethereum";

// Components:
import Handling from "../components/Modal/handling";

function App() {
  // States:
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [claimInfo, setClaimInfo] = useState({
    type: undefined,
    payload: undefined,
  });

  // Web3 States:
  const [airdropContract, setAirdropContract] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);

  useEffect(() => {
    const initWeb3Handler = async () => {
      setLoading(true);
      // await getBlockchain()
      //   .then((result) => {
      //     console.log(result);
      //   })
      //   .catch((err) => console.log(err));
      try {
        const result = await getBlockchain();
        setAccounts(result);
        console.log(result);
        console.log("HELLO");
        setAirdropContract(result.airdrop);
        setAccounts(result.accounts);

        setLoading(false);
      } catch (err) {
        setLoadingMessage(err);
        console.log(err);
        setLoading(false);
      }
    };
    initWeb3Handler();
    console.log(accounts);
  }, []);

  // Functions:
  const claimTokensHandler = async (event) => {
    event.preventDefault();

    const addressInput = event.target.elements[0].value.trim().toLowerCase();
    console.log(addressInput);
    console.log(accounts);

    // Check if address input is the SAME as the one connected:
    // No need to validate address since its checking against the connected address already:
    const doesAddressMatch = accounts.includes(addressInput);
    if (!doesAddressMatch) {
      setClaimInfo({
        type: "failure",
        payload: {
          message:
            "Mismatched address input! Make sure its the address connected to Metamask!!",
        },
      });
      setModal(true);

      // Exit claimTokenshandler function:
      return;
    }

    const addressKeyedIn = addressInput;

    setClaimInfo({
      type: "primary",
      payload: "Checking your address in our whitelist...",
    });

    // Validate Address on database from nextJS & claim tokens upon validation:

    try {
      const response = await axios.post("/api/auth", {
        address: addressKeyedIn,
      });
      console.log(response);
      setClaimInfo({
        type: "primary",
        payload: {
          message: "Claiming from Airdrop Contract...",
          address: response.data.address,
          basicAmount: Web3.utils.fromWei(
            response.data.basicAllocation.toString()
          ),
          bonusAmount: Web3.utils.fromWei(
            response.data.bonusAllocation.toString()
          ),
          totalAmount: Web3.utils.fromWei(
            response.data.totalAllocation.toString()
          ),
        },
      });
      console.log(claimInfo);

      // Since validated, claim tokens:
      const receiptResult = await airdropContract.methods
        .claimAirdropTokens(
          response.data.address,
          response.data.totalAllocation.toString(),
          response.data.signature
        )
        .send({ from: accounts[0] });

      setClaimInfo({
        type: "primary",
        payload: {
          message: `Airdrop successful! Tokens claimed in tx: ${receiptResult.transactionHash}`,
        },
      });
      console.log("claimInfo: ", claimInfo);
      return;
    } catch (err) {
      if (err.message === "Request failed with code 401") {
        // Address not eligible for airdrop:
        setClaimInfo({
          type: "failure",
          payload: {
            message: "Airdrop failed, address not eligible for airdrop.",
          },
        });

        setModal(true);
        return;
      }
      // if not, address has already received airdrop already:
      setClaimInfo({
        type: "failure",
        payload: {
          message: "You have already received your entitled tokens.",
        },
      });
      setModal(true);
    }
  };

  const submitAddrHandler = async (event) => {
    event.preventDefault();
    console.log(event.target.elements[0].value.trim().toLowerCase());

    const address = event.target.elements[0].value.trim().toLowerCase();

    // POST to mongoDB:
    try {
      // Validate address:
      const validatedAddress = Web3.utils.toChecksumAddress(address);
      console.log(validatedAddress);

      // If address is valid, post to database:
      const result = await axios.post("/api/insert", {
        address: validatedAddress,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Head>
        <title>TZY's Airdrop</title>
        <meta
          name="description"
          content="TZY Token Airdrop Now Available on BSC Testnet!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {modal && <Handling setModal={setModal} claimInfo={claimInfo} />}
      <div className="airDropContainer">
        <div className="glassContainer">
          <div className="titleContainer">
            <span className="title">TZY Token Airdrop</span>
            <div className="iconzContainer">
              <img
                className="titleIcon"
                // src="https://img.icons8.com/ios/452/ethereum.png"
                src="images/thunder.png"
                alt="TZYToken"
              />
            </div>
          </div>
          <div className="mainContainer">
            <div className="left">
              <h5 className="card-title">How To Claim Your Tokens?</h5>
              <div className="card-text">
                <ul>
                  <li>
                    <span> Step 1:</span> Make sure you have configured the BSC
                    network with Metamask
                  </li>
                  <li>
                    <span> Step 2:</span> Make sure you have some BNB to pay for
                    transaction fees (~1-2 USD worth of BNB, paid to the
                    network)
                  </li>
                  <li>
                    <span> Step 3:</span> Enter your BSC address and click on
                    submit. This will fetch an authorization signature from the
                    list of whitelisted address
                  </li>
                  <li>
                    <span> Step 4:</span> Confirm the transaction to claim your
                    TZY tokens. This will send a transaction to the Airdrop
                    smart contract
                  </li>
                </ul>
              </div>
            </div>
            <div className="right">
              <span className="txHeader">Transaction Status</span>
              <div className="txDetailsContainer">
                <h7 className="messageLog">
                  Status: {claimInfo.payload?.message}
                </h7>
                <h7 className="addressLog">
                  Address: {claimInfo.payload?.address}
                </h7>
                <h7 className="amountLog">
                  Amount: {claimInfo.payload?.totalAllocation}
                </h7>
              </div>
              <form onSubmit={claimTokensHandler}>
                <input
                  className="textfield"
                  placeholder="Enter your BSC Address here"
                  type="text"
                />
                <button className="submitButton" type="submit">
                  Claim Your Tokens!
                </button>
              </form>
              <div style={{ transform: "translateY(200px)", width: "700px" }}>
                <form className="nth" onSubmit={submitAddrHandler}>
                  <input
                    className="textfield"
                    placeholder="Enter your BSC Address here"
                    type="text"
                  />
                  <button type="submit">Register For Airdrop!</button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <img
          className="glassDesign1"
          src="/images/glassCircle.svg"
          alt="glass1"
        />
        <img
          className="glassDesign2"
          src="/images/glassCircle.svg"
          alt="glass1"
        />
        <img
          className="glassDesign3"
          src="/images/glassCircle.svg"
          alt="glass1"
        />
        <img
          className="glassDesign4"
          src="/images/glassCircle.svg"
          alt="glass1"
        />
      </div>
    </>
  );
}

export default App;
