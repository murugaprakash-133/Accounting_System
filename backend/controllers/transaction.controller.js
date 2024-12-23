import Transaction from "../models/transaction.model.js";

// Create a new transaction
export const createTransaction = async (req, res) => {
  try {
    const { type, date, time, amPm, amount,voucherType, voucherNo, category, account, description } = req.body;

    // Create a new transaction with the authenticated user's ID
    const transaction = new Transaction({
      userId: req.user._id, // Extracted from the protectRoute middleware
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

    const transactions = await Transaction.find(query).sort({ createdAt: -1 });

    // Calculate total income and total expenses
    const totalIncome = transactions
      .filter(transaction => transaction.type === "income")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpenses = transactions
      .filter(transaction => transaction.type === "expense")
      .reduce((acc, curr) => acc + curr.amount, 0);

      // console.log(totalExpenses);
      // console.log(totalIncome);

    // Prepare response
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
    const userId = req.user._id;

    // Validate month and year
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required." });
    }

    // Define start and end of the month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59); // Last day of the month

    // Fetch all transactions for the given month
    const transactions = await Transaction.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Group transactions by day
    const groupedByDay = transactions.reduce((acc, t) => {
      const day = new Date(t.date).getDate(); // Day of the month

      if (!acc[day]) acc[day] = { cashIn: 0, cashOut: 0 };

      if (t.type === "income") {
        acc[day].cashIn += t.amount;
      } else if (t.type === "expense") {
        acc[day].cashOut += t.amount;
      }

      return acc;
    }, {});

    // Calculate total cash in, cash out, and prepare daily data
    const totalCashIn = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCashOut = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netCashFlow = totalCashIn - totalCashOut;

    // Prepare data for each day of the month
    const daysInMonth = new Date(year, month, 0).getDate(); // Number of days in the month
    const cashFlowData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: `Day ${i + 1}`,
      cashIn: groupedByDay[i + 1]?.cashIn || 0,
      cashOut: groupedByDay[i + 1]?.cashOut || 0,
      netCashFlow: (groupedByDay[i + 1]?.cashIn || 0) - (groupedByDay[i + 1]?.cashOut || 0),
    }));

    // Send response
    res.status(200).json({
      cashFlowData,
      totalCashIn,
      totalCashOut,
      netCashFlow,
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
