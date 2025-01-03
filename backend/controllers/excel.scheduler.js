import schedule from "node-schedule";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import XLSX from "xlsx";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import Transfer from "../models/transfer.model.js";
import TransferBank from "../models/transferBank.model.js";
import Transaction from "../models/transaction.model.js";
import Recipient from "../models/recipient.model.js";

// Load environment variables
dotenv.config();

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email transport setup using environment variables
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use environment variables for security
  },
});

// Function to generate Excel and send email
const generateAndSendExcel = async () => {
  try {
    console.log("Starting scheduled task to send emails...");

    // Fetch all recipients from the database
    const recipients = await Recipient.find();
    if (!recipients.length) {
      console.error("No recipients found. Add recipients to send the report.");
      return;
    }

    const emails = recipients.map((recipient) => recipient.email);

    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

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

    const formatData = (data) =>
      data.map((item, index) => ({
        ID: item._id || index + 1,
        Date: new Date(item.date).toLocaleDateString(),
        Time: `${item.time || "N/A"} ${item.amPm || ""}`,
        Description: item.description || "N/A",
        "Transaction Type": item.transactionType || "N/A",
        "Debit(₹)": item.type === "expense" ? item.amount.toFixed(2) : "",
        "Credit(₹)": item.type === "income" ? item.amount.toFixed(2) : "",
        "Balance(₹)": item.balance ? item.balance.toFixed(2) : "N/A",
      }));

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

    const uploadsPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    const filePath = path.join(uploadsPath, "financial_data.xlsx");
    XLSX.writeFile(workbook, filePath);

    const sendEmail = async (email) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Monthly Financial Report",
        text: "Please find the attached financial report for this month.",
        attachments: [
          {
            filename: "financial_data.xlsx",
            path: filePath,
          },
        ],
      };

      return transporter.sendMail(mailOptions);
    };

    const emailPromises = emails.map((email) => sendEmail(email));
    await Promise.all(emailPromises);

    console.log("Emails sent successfully.");
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Error in scheduled email task:", error);
  }
};

// Schedule the task to run every 10 minutes for testing
// schedule.scheduleJob("*/5 * * * *", async () => {
//   await generateAndSendExcel();
// });

// Uncomment for production to run on the last day of the month
schedule.scheduleJob("59 23 28-31 * *", async () => {
  const currentDate = new Date();
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  if (currentDate.getDate() === lastDayOfMonth) {
    await generateAndSendExcel();
  }
});

console.log("Automatic email scheduler initialized.");
