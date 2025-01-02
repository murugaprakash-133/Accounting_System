import schedule from "node-schedule";
import { fileURLToPath } from "url";
import path from "path";
import nodemailer from "nodemailer";
import XLSX from "xlsx";
import fs from "fs";
import Transfer from "../models/transfer.model.js";
import TransferBank from "../models/transferBank.model.js";
import Transaction from "../models/transaction.model.js";

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(__filename);

// Email transport setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kalaiarasankaruppaiya@gmail.com", // Replace with your email
    pass: "essxbuwysdzqkedb", // Replace with your Gmail App Password
  },
});

// Function to generate Excel and send email
const generateAndSendExcel = async () => {
  try {
    // console.log("Starting scheduled task to send email...");

    const email = "laishunoffi@gmail.com"; // Replace with the auditor's email
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; // Current month
    const year = currentDate.getFullYear(); // Current year

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

    const uploadsPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    const filePath = path.join(uploadsPath, "financial_data.xlsx");
    XLSX.writeFile(workbook, filePath);
    // console.log("Excel file written to:", filePath);

    // Email options
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

    // Send email
    await transporter.sendMail(mailOptions);
    // console.log("Email sent successfully to:", email);

    // Clean up the temporary file
    fs.unlinkSync(filePath);
    // console.log("Temporary Excel file deleted:", filePath);
  } catch (error) {
    console.error("Error in generateAndSendExcel:", error);
  }
};

// Schedule the task to run on the last day of every month at 11:59 PM
schedule.scheduleJob("59 23 28-31 * *", async () => {
  // schedule.scheduleJob("*/1 * * * *", async () => {
    // await generateAndSendExcel();
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

// console.log("Automatic email scheduler initialized.");