import Transaction from "../models/transaction.model.js";
import TransferBank from "../models/transferbank.model.js";
import { recalculateBalances } from "../utils/balanceUtils.js";

// Create a new transaction
export const createTransferBank = async (req, res) => {
  try {
    const {
      transactionId, // Accept transactionId from the request
      type,
      date,
      time,
      amPm,
      amount,
      to,
      description,
      transactionType,
      from,
      balance,
    } = req.body;

    const validDate = new Date(date);
    if (isNaN(validDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const transferBank = new TransferBank({
      userId: req.user._id,
      transactionId, // Use the provided transactionId
      type,
      date: validDate,
      time,
      amPm,
      amount,
      to,
      description,
      transactionType,
      from,
      balance,
    });

    await transferBank.save();
    res.status(201).json(transferBank);
  } catch (error) {
    console.error("Error creating transfer bank:", error);
    res
      .status(500)
      .json({ message: error.message || "Error creating transfer bank" });
  }
};

// Get all transfer banks for the authenticated user with optional filters and include balance
export const getTransferBanks = async (req, res) => {
  try {
    const { month, year, type, page = 1, limit = 10 } = req.query;

    // Build dynamic query
    const query = {};

    if (req.user.role !== "Admin") {
      query.userId = req.user._id; // Filter by userId for non-admin users
    }

    // Filter by month and year if provided
    if (month && year) {
      const parsedMonth = parseInt(month, 10);
      const parsedYear = parseInt(year, 10);

      if (isNaN(parsedMonth) || isNaN(parsedYear)) {
        return res
          .status(400)
          .json({ message: "Invalid month or year format" });
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

    // Determine the fetch limit based on user role
    const fetchLimit = req.user.role === "Admin" ? 0 : parseInt(limit, 10);

    // Fetch transfer banks with role-based logic
    const transferBanks = await TransferBank.find(query)
      .sort({ createdAt: -1 }) // Sort by most recent
      .skip(req.user.role === "Admin" ? 0 : (page - 1) * fetchLimit) // Pagination for non-admin users
      .limit(fetchLimit || 0) // No limit for admin
      .select("+balance"); // Include the balance field

    // Count total transfer banks for pagination
    const totalTransferBanks = await TransferBank.countDocuments(query);

    // Respond with the result
    res.status(200).json({
      transferBanks,
      totalTransferBanks,
      totalPages: Math.ceil(totalTransferBanks / limit),
      currentPage: parseInt(page, 10),
    });
  } catch (error) {
    console.error("Error fetching transfer banks:", error);
    res
      .status(500)
      .json({ message: error.message || "Error fetching transfer banks" });
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
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCashOut = transferBanks
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netCashFlow = totalCashIn - totalCashOut;

    const daysInMonth = new Date(parsedYear, parsedMonth, 0).getDate();
    const cashFlowData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: Day`${i + 1}`,
      cashIn: groupedByDay[i + 1]?.cashIn || 0,
      cashOut: groupedByDay[i + 1]?.cashOut || 0,
      netCashFlow:
        (groupedByDay[i + 1]?.cashIn || 0) -
        (groupedByDay[i + 1]?.cashOut || 0),
    }));

    res.status(200).json({
      cashFlowData,
      totalCashIn,
      totalCashOut,
      netCashFlow,
    });
  } catch (error) {
    console.error("Error fetching monthly cash flow data:", error);
    res.status(500).json({
      message: error.message || "Error fetching monthly cash flow data.",
    });
  }
};

// Update a transaction
export const updateTransferBank = async (req, res) => {
  try {
    const { transferBankId } = req.params;
    const updates = req.body;

    const allowedUpdates = [
      "type",
      "date",
      "time",
      "amount",
      "to",
      "description",
      "transactionType",
      "from",
    ];
    const updatesKeys = Object.keys(updates);
    const isValidOperation = updatesKeys.every((key) =>
      allowedUpdates.includes(key)
    );

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
    res
      .status(500)
      .json({ message: error.message || "Error updating transaction" });
  }
};

export const deleteTransferBank = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // console.log("Attempting to delete transferBank with ID:", transactionId);

    // Validate transactionId (custom validation for your format)
    if (!transactionId || !transactionId.startsWith("TXN-")) {
      return res.status(400).json({ message: "Invalid transaction ID format" });
    }

    // Find and delete the transferBank
    const transferBank = await TransferBank.findOneAndDelete({
      transactionId: transactionId,
      userId: req.user._id, // Ensure the user owns the record
    });

    if (!transferBank) {
      return res.status(404).json({ message: "TransferBank not found" });
    }

    // console.log("Successfully deleted transferBank with ID:", transactionId);

    // Delete the corresponding transaction if linked
    const transaction = await Transaction.findOneAndDelete({
      transactionId: transferBank.transactionId,
      userId: req.user._id,
    });

    // if (transaction) {
    //   console.log("Linked transaction deleted:", transaction._id);
    // }

    await recalculateBalances(req.user._id);
    res.status(200).json({
      message: "TransferBank and linked transaction deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting transferBank and linked transaction:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
