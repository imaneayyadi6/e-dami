import colors from "colors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import connectDB from "./config/database.js";
import cron from "node-cron";

dotenv.config();

const __dirname = path.resolve();
const logFilePath = path.join(__dirname, "logs", "e-dami-backup-data-log.txt");

const uri = "mongodb://localhost:27017/e-dami";

const client = new MongoClient(uri);
connectDB();


function formatDocument(document) {
  if (document instanceof ObjectId) {
    return { $oid: document.toString() };
  }

  if (document instanceof Date) {
    return { $date: document.toISOString() };
  }

  if (Array.isArray(document)) {
    return document.map((item) => formatDocument(item));
  }

  if (document && typeof document === "object") {
    const formattedObject = {};
    for (const key in document) {
      if (document.hasOwnProperty(key)) {
        formattedObject[key] = formatDocument(document[key]);
      }
    }
    return formattedObject;
  }

  return document;
}

const backupNetwork = async (collection, data) => {
  try {
    const collectionPath3 = `\\\\192.168.1.161\\a.shaim\\backup\\${collection.collectionName}.json`;

    if (fs.existsSync(collectionPath3)) {
      console.log("File exists. Removing:", collectionPath3);
      await fs.promises.unlink(collectionPath3);
    }

    // Écrire les nouvelles données
    console.log("Writing data to:", collectionPath3);
    await fs.promises.writeFile(collectionPath3, JSON.stringify(data));

    const successLog = `[DATA INSERT] : ${new Date().toLocaleString()} :: Data backed up successfully to \\192.168.1.161\\a.shaim\n`;
    await fs.promises.appendFile(logFilePath, successLog);
    console.log("Backup successful.");
  } catch (error) {
    const errorLog = `[ERROR] : ${new Date().toLocaleString()} :: Backup failed for \\192.168.1.161\\a.shaim ::: ${
      error.stack
    } \n`;
    console.error("Backup failed:", error);
    await fs.promises.appendFile(logFilePath, errorLog);
  }
};

const backupDatabase = async () => {
  try {
    const db = client.db();
    const collections = await db.collections();

    for (let collection of collections) {
      let data = await collection.find().toArray();
      
      data = data.map((doc) => formatDocument(doc));

      const collectionPath1 = path.join(
        __dirname,
        "backup",
        `${collection.collectionName}.json`
      );

      if (fs.existsSync(collectionPath1)) {
        await fs.promises.unlink(collectionPath1);
      }
      await fs.promises.appendFile(collectionPath1, JSON.stringify(data));

      // Chemin du deuxième dossier de backup
      const collectionPath2 = `C:\\Users\\a.shaim\\Desktop\\backup\\${collection.collectionName}.json`;

      if (fs.existsSync(collectionPath2)) {
        await fs.promises.unlink(collectionPath2);
      }
      await fs.promises.appendFile(collectionPath2, JSON.stringify(data));

      backupNetwork(collection, data);
    }

    console.log("Backup completed successfully");
    const dataToWrite = `[DATA INSERT] : ${new Date().toLocaleString()} :: Data has been backed up successfully  \n`;
    fs.appendFileSync(logFilePath, dataToWrite, (err) => {
      if (err) throw err;
      console.log("Data has been backed up successfully !");
    });

    console.log(`Data Inserted succcessfully !`.green.inverse);
  } catch (error) {
    const dataToWrite = `[ERROR] : ${new Date().toLocaleString()} :: ${error} \n`;
    fs.appendFileSync(logFilePath, dataToWrite, (err) => {
      if (err) throw err;
      console.log("Error data backup !");
    });
    console.log(`Error : ${error}`.red.inverse);
  }
};

// backupDatabase();
// Lancement du backup toutes les 3 heures
cron.schedule('0 */3 * * *', async () => {
  try {
    backupDatabase();
  } catch (error) {
    console.error("CRON ERROR:", error);
  }
});
