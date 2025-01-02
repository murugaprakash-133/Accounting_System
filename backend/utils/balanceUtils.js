import Transaction from "../models/transaction.model.js";
import Transfer from "../models/transfer.model.js";
import TransferBank from "../models/transferBank.model.js";

export const recalculateBalances = async (userId) => {
    try {
      // console.log("Recalculating all balances...");
  
      // Step 1: Fetch all transactions, transfers, and transferBanks in chronological order
      const transactions = await Transaction.find({ userId }).sort({ date: 1, time: 1 });
      const transfers = await Transfer.find({ userId }).sort({ date: 1, time: 1 });
      const transferBanks = await TransferBank.find({ userId }).sort({ date: 1, time: 1 });
  
      // Step 2: Initialize running balances for each schema
      let runningBalanceTransaction = 0;
      let runningBalanceTransfer = 0;
      let runningBalanceTransferBank = 0;
  
      // Step 3: Recalculate balances for transactions
      for (let transaction of transactions) {
        if (transaction.type === "income") {
          runningBalanceTransaction += transaction.amount;
        } else if (transaction.type === "expense") {
          runningBalanceTransaction -= transaction.amount;
        }
  
        // Update transaction balance
        await Transaction.findByIdAndUpdate(transaction._id, { balance: runningBalanceTransaction });
      }
  
      // Step 4: Recalculate balances for transfers
      for (let transfer of transfers) {
        if (transfer.transactionType === "income") {
          runningBalanceTransfer += transfer.amount;
        } else if (transfer.transactionType === "expense") {
          runningBalanceTransfer -= transfer.amount;
        }
  
        // Update transfer balance
        await Transfer.findByIdAndUpdate(transfer._id, { balance: runningBalanceTransfer });
      }
  
      // Step 5: Recalculate balances for transferBanks
      for (let transferBank of transferBanks) {
        if (transferBank.transactionType === "income") {
          runningBalanceTransferBank += transferBank.amount;
        } else if (transferBank.transactionType === "expense") {
          runningBalanceTransferBank -= transferBank.amount;
        }
  
        // Update transferBank balance
        await TransferBank.findByIdAndUpdate(transferBank._id, { balance: runningBalanceTransferBank });
      }
  
      // console.log("Recalculated balances successfully.");
    } catch (error) {
      console.error("Error recalculating balances:", error);
      throw new Error("Failed to recalculate balances.");
    }
  };
  