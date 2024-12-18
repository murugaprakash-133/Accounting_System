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
      .filter(transaction => transaction.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpenses = transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

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

// Get aggregated data for the dashboard
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ userId });

    const monthlyData = [];
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    // Calculate monthly totals
    const groupedByMonth = transactions.reduce((acc, t) => {
      const month = new Date(t.date).getMonth(); // Month index (0-11)
      const type = t.type;

      if (!acc[month]) acc[month] = { income: 0, expenses: 0 };
      if (type === 'income') acc[month].income += t.amount;
      if (type === 'expense') acc[month].expenses += t.amount;

      return acc;
    }, {});

    // Prepare monthly data for the chart
    for (let i = 0; i < 12; i++) {
      monthlyData.push({
        name: new Date(0, i).toLocaleString('default', { month: 'short' }),
        income: groupedByMonth[i]?.income || 0,
        expenses: groupedByMonth[i]?.expenses || 0,
      });
    }

    res.status(200).json({
      monthlyData,
      totalIncome,
      totalExpenses,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Error fetching dashboard data." });
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
