import nodemailer from "nodemailer";
import XLSX from "xlsx";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import Transfer from "../models/transfer.model.js";
import TransferBank from "../models/transferBank.model.js";
import Transaction from "../models/transaction.model.js";

// Define __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate and Send Excel
export const generateAndSendExcel = async (req, res) => {
  try {
    const { email, month, year } = req.body;

    if (!email || !month || !year) {
      return res
        .status(400)
        .json({ message: "Email, month, and year are required." });
    }

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
        $lt: new Date(`${year}-${month + 1}-01`),
      },
    });

    const transfers = await Transfer.find({
      date: {
        $gte: new Date(`${year}-${month}-01`),
        $lt: new Date(`${year}-${month + 1}-01`),
      },
    });

    const transferBanks = await TransferBank.find({
      date: {
        $gte: new Date(`${year}-${month}-01`),
        $lt: new Date(`${year}-${month + 1}-01`),
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
    // console.log("Excel file written to:", filePath);

    // Ensure the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error("Failed to create Excel file.");
    }

    // Configure email transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "kalaiarasankaruppaiya@gmail.com",
        pass: "essxbuwysdzqkedb", // App password
      },
    });

    // Email options with attachment
    const mailOptions = {
      from: "kalaiarasankaruppaiya@gmail.com",
      to: "laishunoffi@gmail.com",
      subject: "Monthly Financial Report",
      text: "Please find the attached financial report for this month.",
      attachments: [
        {
          filename: "financial_data.xlsx",
          path: filePath, // Attach the generated Excel file
        },
      ],
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Failed to send email.", error });
      }

      // console.log("Email sent successfully:", info.response);

      // Clean up the temporary file
      fs.unlinkSync(filePath);
      // console.log("Temporary Excel file deleted:", filePath);

      return res
        .status(200)
        .json({ message: "Email sent successfully to the auditor." });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Failed to send email.", error });
  }
};