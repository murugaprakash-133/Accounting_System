import mongoose from "mongoose";

// Transaction Schema
const transferBankSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
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
    from: {
      type: String,
      required: function () {
        return this.type === "transfer";
      },
    },
    balance: {
      type: Number,
      select: false, // Hide from API responses by default
    },
  },
  { timestamps: true }
);

// Pre-save middleware to calculate balance
transferBankSchema.pre("save", async function (next) {
  try {
    // Fetch the last transaction for the user to get the current balance
    const lastTransaction = await this.constructor
      .findOne({ userId: this.userId })
      .sort({ createdAt: -1 })
      .select("+balance");

    const lastBalance = lastTransaction?.balance || 0; // Default to 0 if no previous balance

    // Update balance based on transaction type and from/to fields
    if (this.transactionType === "Internal") {
      if (this.from === "Bank 2" && this.to === "Canara Cyborgforge LLP") {
        this.balance = lastBalance - this.amount; // Subtract for Canara Cyborgforge LLP to Bank 2
      } else if (this.from === "Canara Cyborgforge LLP" && this.to === "Bank 2") {
        this.balance = lastBalance + this.amount; // Add for Bank 2 to Canara Cyborgforge LLP
      }
    } else if (this.transactionType === "External") {
      this.balance = lastBalance - this.amount;
    } else if (this.transactionType === "income") {
      this.balance = lastBalance + this.amount;
    } else if (this.transactionType === "expense") {
      this.balance = lastBalance - this.amount;
    }

    next();
  } catch (err) {
    next(err);
  }
});

const TransferBank = mongoose.model("TransferBank", transferBankSchema);

export default TransferBank;
