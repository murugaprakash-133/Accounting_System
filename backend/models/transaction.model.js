import mongoose from "mongoose";
import Transfer from "./transfer.model.js"; // Adjust import path as necessary
import TransferBank from "./transferBank.model.js"; // Adjust import path as necessary

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
    voucherType: {
      type: String,
      required: function () {
        return this.type !== "transfer";
      },
    },
    voucherNo: {
      type: String,
      default: "",
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
    balance: {
      type: Number,
      select: false, // Hide from API responses by default
    },
  },
  { timestamps: true }
);

// Pre-save middleware to calculate balance
transactionSchema.pre("save", async function (next) {
  try {
    // Fetch the most recent balance from Transfer and TransferBank schemas
    const [lastTransfer, lastTransferBank] = await Promise.all([
      Transfer.findOne({ userId: this.userId })
        .sort({ createdAt: -1 })
        .select("+balance"),
      TransferBank.findOne({ userId: this.userId })
        .sort({ createdAt: -1 })
        .select("+balance"),
    ]);

    // Get the last balances from both schemas, default to 0 if none exist
    const lastTransferBalance = lastTransfer?.balance || 0;
    const lastTransferBankBalance = lastTransferBank?.balance || 0;

    // Calculate the combined last balance
    const combinedLastBalance = lastTransferBalance + lastTransferBankBalance;

    // Update the balance based on the transaction type
    if (this.type === "income") {
      this.balance = combinedLastBalance + this.amount;
    } else if (this.type === "expense") {
      this.balance = combinedLastBalance - this.amount;
    } else if (this.type === "transfer") {
      this.balance = combinedLastBalance; // Assume no balance change for transfer
    }

    next();
  } catch (err) {
    next(err);
  }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
