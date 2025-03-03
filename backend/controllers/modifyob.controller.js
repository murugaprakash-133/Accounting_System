import ModifyOpenBalance from "../models/modifyob.model.js";

// Controller to create a new ModifyOpenBalance entry
export const createModifyOpenBalance = async (req, res) => {
  try {
    const { date, time, reason, previousOB, modifiedOB, bank } = req.body;

    // Validate input
    if (!date || !time || !reason || !previousOB || !modifiedOB || !bank) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create new entry
    const newEntry = new ModifyOpenBalance({
      userId: req.user._id,
      date,
      time,
      reason,
      previousOB,
      modifiedOB,
      bank,
    });

    // Save to the database
    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create entry." });
  }
};

// Controller to fetch the most recent ModifyOpenBalance entries for both Canara Cyborgforge LLP and Bank 2
export const getLastModifiedBalancesForBothBanks = async (req, res) => {
  try {
    // Fetch the most recent ModifyOpenBalance entry for Canara Cyborgforge LLP and Bank 2
    const lastModifiedBalances = await Promise.all([
      ModifyOpenBalance.findOne({ userId: req.user._id, bank: 'Canara Cyborgforge LLP' })
        .sort({ createdAt: -1 }) // Sort by creation date to get the most recent entry
        .limit(1),
      ModifyOpenBalance.findOne({ userId: req.user._id, bank: 'Bank 2' })
        .sort({ createdAt: -1 })
        .limit(1),
    ]);

    // Extract the modifiedOB values for each bank
    const bank1Balance = lastModifiedBalances[0]?.modifiedOB || 0; // Default to 0 if not found
    const bank2Balance = lastModifiedBalances[1]?.modifiedOB || 0; // Default to 0 if not found

    // Send the modified OB values for both banks
    res.status(200).json({ bank1ModifiedOB: bank1Balance, bank2ModifiedOB: bank2Balance });
    // console.log(`Canara Cyborgforge LLP Balance: ${bank1Balance}`);
    // console.log(`Bank 2 Balance: ${bank2Balance}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch last modified balances." });
  }
};
