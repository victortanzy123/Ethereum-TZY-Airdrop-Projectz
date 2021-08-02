const mongoose = require("mongoose");

// Next.js API:
// const Recipient = require("../../MongoDB/recipientSchema");
const Recipient = mongoose.model("Recipient");
const Web3 = require("web3");

// Private Key to sign all signatures:
const PRIVATE_KEY =
  "4adfd19bf820b5f8ba182cb2677d918c9fe90a1d1e1e64dac49a7ab48a484a78";

// POST Authorization API call to verify address on the database:
export default async (req, res) => {
  // Retrieve address:
  await mongoose.connect(
    "mongodb+srv://victortanzy123:Password123!@testing.mfio4.mongodb.net/airdropRecipient?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  );

  console.log("YOOO");

  const recipient = await Recipient.findOne({
    address: req.body.address && req.body.address.toLowerCase(),
  }).exec();

  console.log("doneeeeeeeeeeeeeeeeeee");
  if (recipient) {
    // If recipient address found on database, sign with secretkey:
    const message = Web3.utils
      .soliditySha3(
        { t: "address", v: recipient.address },
        { t: "uint256", v: recipient.totalAllocation }
      )
      .toString("hex");

    console.log("LELLELE");

    const web3 = new Web3("");
    const { signature } = web3.eth.accounts.sign(message, PRIVATE_KEY);

    // Return successful response with the signature to frontend:
    res.status(200).json({
      address: req.body.address,
      basicAllocation: recipient.basicAllocation,
      bonusAllocation: recipient.bonusAllocation,
      totalAllocation: recipient.totalAllocation,
      signature,
    });

    // Dont forget to end the code:
    return;
  }

  // If recipient not found: Return error response:
  res.status(401).json({
    address: req.body.address,
    message: "Address not eligible for airdrop.",
  });
};
