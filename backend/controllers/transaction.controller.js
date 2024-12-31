import Transaction from "../models/transaction.model.js";
import Transfer from "../models/transfer.model.js";
import TransferBank from "../models/transferBank.model.js";

// Create a new transaction
export const createTransaction = async (req, res) => {
  try {
    const {
      type,
      date,
      time,
      amPm,
      amount,
      voucherType,
      voucherNo,
      category,
      account,
      description,
      transactionId, // Accept transactionId from the request
    } = req.body;

    // Fetch the latest balances
    const lastTransfer = await Transfer.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("balance");

    const lastTransferBank = await TransferBank.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("balance");

    const transferBalance = lastTransfer?.balance || 0;
    const transferBankBalance = lastTransferBank?.balance || 0;
    const calculatedBalance = transferBalance + transferBankBalance;

    // Create a new transaction
    const transaction = new Transaction({
      userId: req.user._id,
      transactionId, // Use the provided transactionId
      type,
      date,
      time,
      amPm,
      amount,
      voucherType,
      voucherNo,
      category,
      account,
      description,
      balance: calculatedBalance,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Error creating transaction" });
  }
};



// Get all transactions for the authenticated user with optional filters
export const getTransactions = async (req, res) => {
  try {
    const { month, year, type } = req.query;

    // Build dynamic query
    const query = { userId: req.user._id };

    // Filter by month and year if provided
    if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59); // Last day of the month
      query.date = {
        $gte: startOfMonth,
        $lte: endOfMonth,
      };
    }

    // Filter by type (income/expense/transfer) if provided
    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .select("+balance"); // Include the balance field

    // Calculate total income and expenses
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json({
      transactions,
      totalIncome,
      totalExpenses,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

// Get monthly cash flow data dynamically
export const getMonthlyCashFlowData = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required." });
    }

    const userId = req.user._id;
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const groupedByDay = transactions.reduce((acc, t) => {
      const day = new Date(t.date).getDate(); // Day of the month
      acc[day] = acc[day] || { cashIn: 0, cashOut: 0 };
      if (t.type === "income") acc[day].cashIn += t.amount;
      if (t.type === "expense") acc[day].cashOut += t.amount;
      return acc;
    }, {});

    const totalCashIn = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalCashOut = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const daysInMonth = new Date(year, month, 0).getDate();
    const cashFlowData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: `Day ${i + 1}`,
      cashIn: groupedByDay[i + 1]?.cashIn || 0,
      cashOut: groupedByDay[i + 1]?.cashOut || 0,
      netCashFlow:
        (groupedByDay[i + 1]?.cashIn || 0) - (groupedByDay[i + 1]?.cashOut || 0),
    }));

    res.status(200).json({
      cashFlowData,
      totalCashIn,
      totalCashOut,
      netCashFlow: totalCashIn - totalCashOut,
    });
  } catch (error) {
    console.error("Error fetching monthly cash flow data:", error);
    res.status(500).json({ message: "Error fetching monthly cash flow data." });
  }
};

// Update a transaction
export const updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const updates = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId: req.user._id },
      updates,
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Error updating transaction" });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    console.log("Attempting to delete transaction with ID:", transactionId);

    // Validate transactionId (custom validation for your format)
    if (!transactionId || !transactionId.startsWith("TXN-")) {
      return res.status(400).json({ message: "Invalid transaction ID format" });
    }

    // Find and delete the transaction
    const transaction = await Transaction.findOneAndDelete({
      transactionId: transactionId, // Match by transactionId
      userId: req.user._id, // Ensure the user owns the record
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    console.log("Successfully deleted transaction with ID:", transactionId);

    // Delete the corresponding entry in Transfer or TransferBank schema
    const transfer = await Transfer.findOneAndDelete({
      transactionId: transactionId, // Match by transactionId
      userId: req.user._id,
    });

    if (transfer) {
      console.log("Linked transfer deleted:", transfer._id);
    }

    const transferBank = await TransferBank.findOneAndDelete({
      transactionId: transactionId, // Match by transactionId
      userId: req.user._id,
    });

    if (transferBank) {
      console.log("Linked transferBank deleted:", transferBank._id);
    }

    res.status(200).json({
      message: "Transaction and linked records deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting transaction and linked records:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

