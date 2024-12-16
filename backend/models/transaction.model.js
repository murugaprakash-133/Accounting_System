import mongoose from "mongoose";

// Transaction Schema
const transactionSchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: function () {
        return this.type !== "transfer";
      },
    },
    account: {
      type: String,
      required: function () {
        return this.type !== "transfer";
      },
    },
    from: {
      type: String,
      required: function () {
        return this.type === "transfer";
      },
    },
    to: {
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
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
