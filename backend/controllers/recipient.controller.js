import Recipient from "../models/recipient.model.js";

// Add a new recipient
export const addRecipient = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const newRecipient = new Recipient({
      email,
      addedBy: req.user._id, // Assuming `protectRoute` attaches the user to the request
    });

    await newRecipient.save();
    res.status(201).json({ message: "Recipient added successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to add recipient.", error });
  }
};

// Delete a recipient
export const deleteRecipient = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRecipient = await Recipient.findByIdAndDelete(id);

    if (!deletedRecipient) {
      return res.status(404).json({ message: "Recipient not found." });
    }

    res.status(200).json({ message: "Recipient deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete recipient.", error });
  }
};

// Get all recipients
export const getRecipients = async (req, res) => {
  try {
    const recipients = await Recipient.find();
    res.status(200).json(recipients);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recipients.", error });
  }
};
