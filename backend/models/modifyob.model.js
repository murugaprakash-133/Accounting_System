import mongoose from "mongoose";

// ModifyOpenBalance Schema
const modifyOpenBalanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    bank: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    previousOB: {
      type: Number,
      required: true,
    },
    modifiedOB: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const ModifyOpenBalance = mongoose.model("ModifyOpenBalance", modifyOpenBalanceSchema);

export default ModifyOpenBalance;
