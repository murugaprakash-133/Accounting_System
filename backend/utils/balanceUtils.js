import Transaction from "../models/transaction.model.js";
import Transfer from "../models/transfer.model.js";
import TransferBank from "../models/transferBank.model.js";

export const recalculateBalances = async (userId) => {
  try {
    // Fetch all transactions for the user in chronological order
    const transactions = await Transaction.find({ userId }).sort({ date: 1, time: 1 });

    let runningBalance = 0;

    // Recalculate balances for transactions
    for (let transaction of transactions) {
      if (transaction.type === "income") {
        runningBalance += transaction.amount;
      } else if (transaction.type === "expense") {
        runningBalance -= transaction.amount;
      }

      // Update the balance in the database
      await Transaction.findByIdAndUpdate(transaction._id, { balance: runningBalance });
    }

    // Fetch and recalculate balances for transfers
    const transfers = await Transfer.find({ userId }).sort({ date: 1, time: 1 });
    runningBalance = 0; // Reset running balance

    for (let transfer of transfers) {
      if (transfer.transactionType === "income") {
        runningBalance += transfer.amount;
      } else if (transfer.transactionType === "expense") {
        runningBalance -= transfer.amount;
      }

      // Update the balance in the database
      await Transfer.findByIdAndUpdate(transfer._id, { balance: runningBalance });
    }

    // Fetch and recalculate balances for transfer banks
    const transferBanks = await TransferBank.find({ userId }).sort({ date: 1, time: 1 });
    runningBalance = 0; // Reset running balance

    for (let transferBank of transferBanks) {
      if (transferBank.transactionType === "income") {
        runningBalance += transferBank.amount;
      } else if (transferBank.transactionType === "expense") {
        runningBalance -= transferBank.amount;
      }

      // Update the balance in the database
      await TransferBank.findByIdAndUpdate(transferBank._id, { balance: runningBalance });
    }
  } catch (error) {
    console.error("Error recalculating balances:", error);
    throw new Error("Failed to recalculate balances.");
  }
};
