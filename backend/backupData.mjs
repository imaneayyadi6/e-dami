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

const backupFolderPath = path.join(__dirname, "backup");
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

      // const collectionPath2 = "C:\\Users\\a.shaim\\Desktop\\backup";

      // backup data in folder 1 :
      if (fs.existsSync(collectionPath1)) {
        await fs.promises.unlink(collectionPath1);
        await fs.promises.appendFile(collectionPath1, JSON.stringify(data));
      } else {
        await fs.promises.appendFile(collectionPath1, JSON.stringify(data));
      }

      // // backup data in folder 2 :
      // if (fs.existsSync(collectionPath2)) {
      //   await fs.promises.appendFile(collectionPath2, "");
      //   await fs.promises.appendFile(collectionPath2, JSON.stringify(data));
      // } else {
      //   await fs.promises.appendFile(collectionPath2, JSON.stringify(data));
      // }
    }

    console.log("Backup completed successfully");
    const dataToWrite = `[DATA INSERT] : ${new Date()} ============> Data has been backed up successfully  \n`;
    fs.appendFileSync(logFilePath, dataToWrite, (err) => {
      if (err) throw err;
      console.log("Data has been backed up successfully !");
    });

    console.log(`Data Inserted succcessfully !`.green.inverse);
    process.exit();
  } catch (error) {
    const dataToWrite = `[ERROR] : ${new Date()} ============> ${error} \n`;
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
