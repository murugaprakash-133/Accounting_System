import mongoose from "mongoose";

// Transaction Schema
const transferSchema = new mongoose.Schema(
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
    transactionType: {
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
    description: {
      type: String,
      default: "",
    },
    bankName: {
      type: String,
      required: function () {
        return this.type === "transfer";
      },
    },
    bank: {
      type: String,
      required: function () {
        return this.type === "transfer";
      },
    },
  },
  { timestamps: true }
);

const Transfer = mongoose.model("Transfer", transferSchema);

export default Transfer;
