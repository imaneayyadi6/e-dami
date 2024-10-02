import colors from "colors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import connectDB from "./config/database.js";
import cron from "node-cron";

dotenv.config();

// Define the uploads as static folder :
const __dirname = path.resolve();
const logFilePath = path.join(__dirname, "logs", "e-dami-backup-data-log.txt");

// MongoDB connection URI
const uri = "mongodb://localhost:27017/e-dami";

// Create a new MongoClient
const client = new MongoClient(uri);
// Connect to the MongoDB server
connectDB();

const backupDatabase = async () => {
  try {
    const db = client.db();
    const collections = await db.collections();

    // Iterate over collections and backup each one
    for (let collection of collections) {
      const data = await collection.find().toArray();
      // Store or export the data as needed (e.g., write to a file)
      const collectionPath1 = path.join(
        __dirname,
        "backup",
        `${collection.collectionName}.json`
      );

      // backup data in folder 1 :
      if (fs.existsSync(collectionPath1)) {
        await fs.promises.unlink(collectionPath1);
        await fs.promises.appendFile(collectionPath1, JSON.stringify(data));
      } else {
        await fs.promises.appendFile(collectionPath1, JSON.stringify(data));
      }

      // backup data in folder 2 :
      const collectionPath2 = `C:\\Users\\a.shaim\\Desktop\\backup\\${collection.collectionName}.json`;

      // backup data in folder 1 :
      if (fs.existsSync(collectionPath2)) {
        // Check if it's a directory
        const stats = await fs.promises.stat(collectionPath2);
        if (stats.isDirectory()) {
          await fs.promises.rmdir(collectionPath2, { recursive: true });
          await fs.promises.unlink(collectionPath2);
        } else {
          await fs.promises.unlink(collectionPath2);
        }
        await fs.promises.appendFile(collectionPath2, JSON.stringify(data));
      } else {
        await fs.promises.appendFile(collectionPath2, JSON.stringify(data));
      }
    }

    console.log("Backup completed successfully");
    const dataToWrite = `[DATA INSERT] : ${new Date().toLocaleString()} ============> Data has been backed up successfully  \n`;
    fs.appendFileSync(logFilePath, dataToWrite, (err) => {
      if (err) throw err;
      console.log("Data has been backed up successfully !");
    });

    console.log(`Data Inserted succcessfully !`.green.inverse);
    process.exit();
  } catch (error) {
    const dataToWrite = `[ERROR] : ${new Date().toLocaleString()} ============> ${error} \n`;
    fs.appendFileSync(logFilePath, dataToWrite, (err) => {
      if (err) throw err;
      console.log("error data backup !");
    });
    console.log(`Error : ${error}`.red.inverse);
    process.exit();
  }
};

cron.schedule("*/2 * * * *", async () => {
  try {
    backupDatabase();
  } catch (error) {
    console.error("CRON ERROR:", error);
  }
});
