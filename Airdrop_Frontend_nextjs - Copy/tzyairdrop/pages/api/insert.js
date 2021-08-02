const mongoose = require("mongoose");

const web3 = require("web3");

// const Recipient = require("../../MongoDB/recipientSchema");
const Recipient = mongoose.model("Recipient");

export default async (req, res) => {
  // Connect to MongoDB:
  await mongoose.connect(
    "mongodb+srv://victortanzy123:Password123!@testing.mfio4.mongodb.net/airdropRecipient?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  );

  // Prevent duplicate copies by first finding:
  const totalAddressesRegistered = await Recipient.find().countDocuments();

  try {
    const user = await Recipient.findOne({ address: req.body.address }).exec();

    if (totalAddressesRegistered <= 15 && !user) {
      // Address is eligible for bonus allocation:
      const airdropDetails = new Recipient({
        address: req.body.address,
        bonusAllocation: web3.utils.toWei("1", "ether").toString(),
        basicAllocation: web3.utils.toWei("2", "ether").toString(),
        totalAllocation: web3.utils.toWei("3", "ether").toString(),
      });

      const result = await airdropDetails.save();

      res.status(201).json({
        message: "Successfully registered as a premium address!",
        registerDetails: result,
      });
    } else if (totalAddressesRegistered > 15 && !user) {
      // Address is  NOT eligible for bonus allocation:
      const airdropDetails = new Recipient({
        address: req.body.address,
        bonusAllocation: web3.utils.toWei("1", "ether").toString(),
        basicAllocation: "0",
        totalAllocation: web3.utils.toWei("1", "ether").toString(),
      });

      const result = await airdropDetails.save();

      res.status(201).json({
        message: "Successfully registered as a normal address!",
        registerDetails: result,
      });
    } else if (!user) {
      res.status(401).json({ message: "Address has already been registered!" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "error connecting to mongoDB!" });
  }
};
