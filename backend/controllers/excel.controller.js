import nodemailer from "nodemailer";
import XLSX from "xlsx";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import Transfer from "../models/transfer.model.js";
import TransferBank from "../models/transferBank.model.js";
import Transaction from "../models/transaction.model.js";
import Recipient from "../models/recipient.model.js";

// Load environment variables
dotenv.config();

// Define __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateAndSendExcel = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res
        .status(400)
        .json({ message: "Month and year are required." });
    }

    // Fetch all recipients
    const recipients = await Recipient.find();
    if (!recipients.length) {
      return res
        .status(400)
        .json({ message: "No recipients found. Add recipients to send the report." });
    }

    const emails = recipients.map((recipient) => recipient.email);

    // Ensure the uploads folder exists
    const uploadsPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    // Define filePath
    const filePath = path.join(uploadsPath, "financial_data.xlsx");

    // Fetch data from MongoDB
    const transactions = await Transaction.find({
      date: {
        $gte: new Date(`${year}-${month}-01`),
        $lt: new Date(`${year}-${parseInt(month) + 1}-01`),
      },
    });

    const transfers = await Transfer.find({
      date: {
        $gte: new Date(`${year}-${month}-01`),
        $lt: new Date(`${year}-${parseInt(month) + 1}-01`),
      },
    });

    const transferBanks = await TransferBank.find({
      date: {
        $gte: new Date(`${year}-${month}-01`),
        $lt: new Date(`${year}-${parseInt(month) + 1}-01`),
      },
    });

    // Format data for Excel
    const formatData = (data) => {
      return data.map((item, index) => ({
        ID: item._id || index + 1,
        Date: new Date(item.date).toLocaleDateString(),
        Time: `${item.time || "N/A"} ${item.amPm || ""}`,
        Description: item.description || "N/A",
        "Transaction Type": item.transactionType || "N/A",
        "Debit(₹)": item.type === "expense" ? item.amount.toFixed(2) : "",
        "Credit(₹)": item.type === "income" ? item.amount.toFixed(2) : "",
        "Balance(₹)": item.balance ? item.balance.toFixed(2) : "N/A",
      }));
    };

    // Create Excel Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(formatData(transactions)),
      "Transactions"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(formatData(transfers)),
      "Transfers"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(formatData(transferBanks)),
      "TransferBanks"
    );

    // Write Excel file to filePath
    XLSX.writeFile(workbook, filePath);

    // Configure email transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use environment variables for security
      },
    });

    // Send the email to each recipient
    const sendEmail = async (email) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Monthly Financial Report",
        text: "Please find the attached financial report for this month.",
        attachments: [
          {
            filename: "financial_data.xlsx",
            path: filePath, // Attach the generated Excel file
          },
        ],
      };

      return transporter.sendMail(mailOptions);
    };

    const emailPromises = emails.map((email) => sendEmail(email));

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    // Clean up the temporary file
    fs.unlinkSync(filePath);

    return res.status(200).json({ message: "Emails sent successfully to all recipients." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Failed to send emails.", error });
  }
};
