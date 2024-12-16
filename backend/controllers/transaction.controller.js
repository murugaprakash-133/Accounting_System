import Transaction from "../models/transaction.model.js";

// Create a new transaction
export const createTransaction = async (req, res) => {
  try {
    const { type, date, time, amPm, amount, category, account, from, to, note } = req.body;

    // Create a new transaction with the authenticated user's ID
    const transaction = new Transaction({
      userId: req.user._id, // Extracted from the protectRoute middleware
      type,
      date,
      time,
      amPm,
      amount,
      category,
      account,
      from,
      to,
      note,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Error creating transaction" });
  }
};

// Get all transactions for the authenticated user
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Calculate total income and total expenses
    const totalIncome = transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

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

// Update a transaction
export const updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const updates = req.body;

    // Ensure the transaction belongs to the authenticated user
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

// Delete a transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Ensure the transaction belongs to the authenticated user
    const transaction = await Transaction.findOneAndDelete({
      _id: transactionId,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Error deleting transaction" });
  }
};
