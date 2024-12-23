import TransferBank from "../models/transferBank.model.js";

// Create a new transaction
export const createTransferBank = async (req, res) => {
  try {
    const { type, date, time, amPm, amount, to, description, transactionType, bankName, bank } = req.body;

    // Validate date
    const validDate = new Date(date);
    if (isNaN(validDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Create a new transaction with the authenticated user's ID
    const transferBank = new TransferBank({
      userId: req.user._id, // Extracted from the protectRoute middleware
      type,
      date: validDate,
      time,
      amPm,
      amount,
      to,
      description,
      transactionType,
      bankName,
      bank,
    });
    // console.log(transferBank);

    await transferBank.save();
    res.status(201).json(transferBank);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: error.message || "Error creating transaction" });
  }
};

// Get all transactions for the authenticated user with optional filters
export const getTransferBanks = async (req, res) => {
  try {
    const { month, year, type, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user._id };

    // Validate and filter by month and year if provided
    if (month && year) {
      const parsedMonth = parseInt(month, 10);
      const parsedYear = parseInt(year, 10);

      if (isNaN(parsedMonth) || isNaN(parsedYear)) {
        return res.status(400).json({ message: "Invalid month or year format" });
      }

      const startOfMonth = new Date(parsedYear, parsedMonth - 1, 1);
      const endOfMonth = new Date(parsedYear, parsedMonth, 0, 23, 59, 59); // Last day of the month
      query.date = {
        $gte: startOfMonth,
        $lte: endOfMonth,
      };
    }

    // Filter by type (income/expense/transferBank) if provided
    if (type) {
      query.type = type;
    }

    const transferBanks = await TransferBank.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    const totalTransferBanks = await TransferBank.countDocuments(query);

    // Calculate total income and expenses
    const totalIncome = transferBanks
      .filter(transferBank => transferBank.type === "income")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpenses = transferBanks
      .filter(transferBank => transferBank.type === "expense")
      .reduce((acc, curr) => acc + curr.amount, 0);

    res.status(200).json({
      transferBanks,
      totalTransferBanks,
      totalPages: Math.ceil(totalTransferBanks / limit),
      currentPage: page,
      totalIncome,
      totalExpenses,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: error.message || "Error fetching transactions" });
  }
};

// Get monthly cash flow data dynamically
export const getMonthlyCashFlowData = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user._id;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required." });
    }

    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    if (isNaN(parsedMonth) || isNaN(parsedYear)) {
      return res.status(400).json({ message: "Invalid month or year format" });
    }

    const startOfMonth = new Date(parsedYear, parsedMonth - 1, 1);
    const endOfMonth = new Date(parsedYear, parsedMonth, 0, 23, 59, 59);

    const transferBanks = await TransferBank.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const groupedByDay = transferBanks.reduce((acc, t) => {
      const day = new Date(t.date).getDate();

      if (!acc[day]) acc[day] = { cashIn: 0, cashOut: 0 };

      if (t.type === "income") {
        acc[day].cashIn += t.amount;
      } else if (t.type === "expense") {
        acc[day].cashOut += t.amount;
      }

      return acc;
    }, {});

    const totalCashIn = transferBanks
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCashOut = transferBanks
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netCashFlow = totalCashIn - totalCashOut;

    const daysInMonth = new Date(parsedYear, parsedMonth, 0).getDate();
    const cashFlowData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: `Day ${i + 1}`,
      cashIn: groupedByDay[i + 1]?.cashIn || 0,
      cashOut: groupedByDay[i + 1]?.cashOut || 0,
      netCashFlow: (groupedByDay[i + 1]?.cashIn || 0) - (groupedByDay[i + 1]?.cashOut || 0),
    }));

    res.status(200).json({
      cashFlowData,
      totalCashIn,
      totalCashOut,
      netCashFlow,
    });
  } catch (error) {
    console.error("Error fetching monthly cash flow data:", error);
    res.status(500).json({ message: error.message || "Error fetching monthly cash flow data." });
  }
};

// Update a transaction
export const updateTransferBank = async (req, res) => {
  try {
    const { transferBankId } = req.params;
    const updates = req.body;

    const allowedUpdates = ["type", "date", "time", "amount", "to", "description", "transactionType", "bankName", "bank"];
    const updatesKeys = Object.keys(updates);
    const isValidOperation = updatesKeys.every(key => allowedUpdates.includes(key));

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates" });
    }

    const transferBank = await TransferBank.findOneAndUpdate(
      { _id: transferBankId, userId: req.user._id },
      updates,
      { new: true }
    );

    if (!transferBank) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transferBank);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: error.message || "Error updating transaction" });
  }
};

// Delete a transaction
export const deleteTransferBank = async (req, res) => {
  try {
    const { transferBankId } = req.params;

    const transferBank = await TransferBank.findOneAndDelete({
      _id: transferBankId,
      userId: req.user._id,
    });

    if (!transferBank) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: error.message || "Error deleting transaction" });
  }
};
