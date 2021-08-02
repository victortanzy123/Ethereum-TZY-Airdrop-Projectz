const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const recipientSchema = new Schema(
  {
    address: {
      type: String,
      required: true,
    },
    basicAllocation: {
      type: String,
      required: true,
    },
    bonusAllocation: {
      type: String,
    },
    totalAllocation: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipient", recipientSchema);
