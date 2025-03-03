import axios from "axios";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
// Init dotenv :
dotenv.config();

// Define the uploads as static folder :
const __dirname = path.resolve();
const logFilePath = path.join(__dirname, "logs", "e-dami-itop-log.txt");

const sequelize = new Sequelize(
  process.env.ITOP_DATABASE_NAME,
  process.env.ITOP_DATABASE_USERNAME,
  process.env.ITOP_DATABASE_PASSWORD,
  {
    host: process.env.ITOP_DATABSE_HOST,
    dialect: "mysql",
    port: 3306,
    dialectOptions: {
      connectTimeout: 60000, // 60 seconds
    },
    pool: {
      acquire: 60000, // 60 seconds
    },
  }
);

// Encode your iTop credentials (username and password) for basic authentication
const credentials = Buffer.from(
  `${process.env.ITOP_USERNAME}:${process.env.ITOP_PASSWORD}`
).toString("base64");

async function getOrganizationIdByCode(code) {
  if (!code) return null; // Return null if code is empty
  const query = `SELECT * FROM organization WHERE code = ?`;
  const result = await sequelize.query(query, {
    replacements: [code], // Using parameterized query to avoid SQL injection
    type: Sequelize.QueryTypes.SELECT,
  });
  return result[0] ? result[0].id : null; // Return the id if found, otherwise null
}

async function getClientOrganizationId(
  client_service,
  client_departement,
  client_direction
) {
  // Attempt to get organization ID in the defined priority order
  let client_org_id = await getOrganizationIdByCode(client_service);

  if (!client_org_id) {
    client_org_id = await getOrganizationIdByCode(client_departement);
  }
  if (!client_org_id) {
    client_org_id = await getOrganizationIdByCode(client_direction);
  }

  return client_org_id;
}


export const createItopTicket = async ({
  title,
  lien,
  agent_matricule,
  agent_service,
  client_matricule,
  client_service,
  client_departement,
  client_direction,
}) => {
  try {
    // recuperer le l'id de client
    const query1 = `SELECT * FROM person where employee_number = '${client_matricule}'`;
    const resSql1 = await sequelize.query(query1, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const caller = resSql1[0] ? resSql1[0].id : null;

    console.log("client_departement :", client_departement);

    const client_org_id = await getClientOrganizationId(
      client_service,
      client_departement,
      client_direction
    );
    const queryAgent = `SELECT * FROM person WHERE employee_number = '${agent_matricule}'`;
    const resSqlAgent = await sequelize.query(queryAgent, {
      type: Sequelize.QueryTypes.SELECT,
    });
    const agent_id = resSqlAgent[0] ? resSqlAgent[0].id : null;

    const query3 = `SELECT * FROM organization where code = '${agent_service}'`;
    const resSql3 = await sequelize.query(query3, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const agent_org_id = resSql3[0] ? resSql3[0].id : null;

    if (client_org_id && caller && agent_id) {
      // Define the JSON data for creating a new ticket
      const ticketData = {
        operation: "core/create",
        class: "UserRequest",
        comment: title + ` | lien sur e-dami ---> ${lien}`,
        fields: {
          title: title,
          description: title + ` | lien sur e-dami ---> ${lien}`,
          caller_id: caller,
          org_id: client_org_id,
          impact: "3",
          urgency: "3",
          priority: "3",
          status: "assigned",
          agent_id: agent_id,
          // team_id: agent_org_id,
        },
      };

      // Make a POST request to create the ticket
      axios
        .post(
          process.env.ITOP_ADDRESS,
          { json_data: JSON.stringify(ticketData) },
          {
            headers: {
              Authorization: `Basic ${credentials}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then((response) => {
          const dataToWrite = `[TICKET CREATED SUCCESSFULLY] : ${new Date().toLocaleString()} ============> Ticket Created succcessfully by : ${client_matricule} && Agent : ${agent_matricule}  \n`;
          console.log("TICKET RESPONSE :", response.data);

          fs.appendFileSync(logFilePath, dataToWrite, (err) => {
            if (err) throw err;
            console.log(`ticket created succcessfully !`.green.inverse);
          });
        })
        .catch((error) => {
          const dataToWrite = `[TICKET CREATED ERROR] : ${new Date().toLocaleString()} ============> ${error} \n`;
          fs.appendFileSync(logFilePath, dataToWrite, (err) => {
            if (err) throw err;
            console.log(`Error : ${error}`.red.inverse);
          });
        });
    } else {
      const dataToWrite = `[TICKET CREATED ERROR] : ${new Date().toLocaleString()} :: Information not defined correctly (by : ${client_matricule} && Agent : ${agent_matricule}) \n`;
      fs.appendFileSync(logFilePath, dataToWrite, (err) => {
        if (err) throw err;
        console.log(`Error : ${error}`.red.inverse);
      });
    }
  } catch (error) {
    const dataToWrite = `[TICKET CREATED ERROR] : ${new Date().toLocaleString()} :: ${error} (by : ${client_matricule} && Agent : ${agent_matricule}) \n`;
    fs.appendFileSync(logFilePath, dataToWrite, (err) => {
      if (err) throw err;
      console.log(`Error : ${error}`.red.inverse);
    });
  }
};
