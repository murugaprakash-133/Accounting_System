import mongoose from "mongoose";
import Transfer from "./transfer.model.js"; // Adjust import path as necessary
import TransferBank from "./transferbank.model.js"; // Adjust import path as necessary

// Transaction Schema
const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true, // Ensure every transaction has a unique ID
    },
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
      default: "N/A",
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

// Middleware to set custom transactionId
transactionSchema.pre("save", async function (next) {
  try {
    // Check if transactionId already exists
    if (!this.transactionId) {
      // Generate a unique transactionId (e.g., use a prefix + timestamp)
      const timestamp = Date.now().toString();
      this.transactionId = `TXN-${this.userId}-${timestamp}`;
    }

    // Fetch the most recent balance from Transfer and TransferBank schemas
    const [lastTransfer, lastTransferBank] = await Promise.all([
      Transfer.findOne({ userId: this.userId })
        .sort({ createdAt: -1 })
        .select("+balance"),
      TransferBank.findOne({ userId: this.userId })
        .sort({ createdAt: -1 })
        .select("+balance"),
    ]);

    const lastTransferBalance = lastTransfer?.balance || 0;
    const lastTransferBankBalance = lastTransferBank?.balance || 0;

    const combinedLastBalance = lastTransferBalance + lastTransferBankBalance;

    if (this.type === "income") {
      this.balance = combinedLastBalance + this.amount;
    } else if (this.type === "expense") {
      this.balance = combinedLastBalance - this.amount;
    } else if (this.type === "transfer") {
      this.balance = combinedLastBalance; // No change for transfer
    }

    next();
  } catch (err) {
    next(err);
  }
});


const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;