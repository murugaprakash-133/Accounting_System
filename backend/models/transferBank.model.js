import mongoose from "mongoose";

// Transaction Schema
const transferBankSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense", "transfer"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    to: {
      type: String,
      required: function () {
        return this.type === "transfer";
      },
    },
    transactionType: {
      type: String,
      required: function () {
        return this.type === "transfer";
      },
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    amPm: {
      type: String,
      enum: ["AM", "PM"],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    from: {
      type: String,
      enum: ["Bank 1", "Bank 2"],
      required: function () {
        return this.type === "transfer";
      },
    },
  },
  { timestamps: true }
);

const TransferBank = mongoose.model("TransferBank", transferBankSchema);

export default TransferBank;
