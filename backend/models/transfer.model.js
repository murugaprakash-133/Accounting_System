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
      enum: ["Internal", "External"],
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
transferSchema.pre("save", async function (next) {
  try {
    // Fetch the last transaction for the user to get the current balance
    const lastTransaction = await this.constructor
      .findOne({ userId: this.userId })
      .sort({ createdAt: -1 })
      .select("+balance");

    const lastBalance = lastTransaction?.balance || 0; // Default to 0 if no previous balance

    // Update balance based on transaction type and from/to fields
    if (this.transactionType === "Internal") {
      if (this.from === "Bank 1" && this.to === "Bank 2") {
        this.balance = lastBalance - this.amount; // Subtract for Bank 1 to Bank 2
      } else if (this.from === "Bank 2" && this.to === "Bank 1") {
        this.balance = lastBalance + this.amount; // Add for Bank 2 to Bank 1
      }
    } else if (this.transactionType === "External") {
      this.balance = lastBalance - this.amount;
    }

    next();
  } catch (err) {
    next(err);
  }
});

const Transfer = mongoose.model("Transfer", transferSchema);

export default Transfer;
