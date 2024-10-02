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
    host: "192.168.3.13",
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

export const createItopTicket = async ({
  title,
  matricule,
  uo,
  lien,
  agent_matricule,
}) => {
  try {
    const query1 = `SELECT * FROM person where employee_number = '${matricule}'`;
    const resSql1 = await sequelize.query(query1, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const caller = resSql1[0].id;

    console.log("CALLER :", caller);

    const query2 = `SELECT * FROM organization where code = '${uo}'`;
    const resSql2 = await sequelize.query(query2, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const org_id = resSql2[0].id;

    console.log("ORG_ID :", org_id);

    const queryAgent = `SELECT * FROM person WHERE employee_number = '${agent_matricule}'`;
    const resSqlAgent = await sequelize.query(queryAgent, {
      type: Sequelize.QueryTypes.SELECT,
    });
    const agent_id = resSqlAgent[0].id;

    if (org_id && caller) {
      // Define the JSON data for creating a new ticket
      const ticketData = {
        operation: "core/create",
        class: "UserRequest",
        comment: title + ` | lien sur e-dami ---> ${lien}`,
        fields: {
          title: title,
          description: title + ` | lien sur e-dami ---> ${lien}`,
          caller_id: caller,
          org_id: org_id,
          // team_id: org_id,
          impact: "2",
          urgency: "2",
          priority: "2",
          status: "new",
          // agent_id: agent_id, // Assignation du ticket à l'agent
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
          const dataToWrite = `[TICKET CREATED] : ${new Date().toLocaleString()} ============> Ticket Created succcessfully \n`;
          console.log("TICKET RESPONSE :", response.data);

          fs.appendFileSync(logFilePath, dataToWrite, (err) => {
            if (err) throw err;
            console.log(`ticket created succcessfully !`.green.inverse);
          });

          let objectsData = Object.values(response.data.objects)[0];
          let ticketId = objectsData.key; // assuming the created ticket ID is returned in response

          // If the agent_id is available, assign the ticket to the agent
          if (agent_id) {
            const ticketUpdateData = {
              operation: "core/update",
              class: "UserRequest",
              key: ticketId,
              fields: {
                agent_id: agent_id,
                status: "assigned", // Optional: You can change the status to "assigned" if needed
              },
            };

            // Make a PUT request to update the ticket with agent assignment
            axios
              .put(
                process.env.ITOP_ADDRESS,
                { json_data: JSON.stringify(ticketUpdateData) },
                {
                  headers: {
                    Authorization: `Basic ${credentials}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                }
              )
              .then((response) => {
                const updateLog = `[TICKET UPDATED] : ${new Date().toLocaleString()} ============> Ticket ID: ${ticketId} assigned to agent ${agent_matricule} \n`;
                fs.appendFileSync(logFilePath, updateLog, (err) => {
                  if (err) throw err;
                  console.log(`ticket updated succcessfully !`.green.inverse);
                });
              })
              .catch((error) => {
                const dataToWrite = `[TICKET UPDATE ERROR] : ${new Date().toLocaleString()} ============> ${error} \n`;
                fs.appendFileSync(logFilePath, dataToWrite, (err) => {
                  if (err) throw err;
                  console.log(`Error : ${error}`.red.inverse);
                });
              });
          }
        })
        .catch((error) => {
          const dataToWrite = `[TICKET ERROR] : ${new Date().toLocaleString()} ============> ${error} \n`;
          fs.appendFileSync(logFilePath, dataToWrite, (err) => {
            if (err) throw err;
            console.log(`Error : ${error}`.red.inverse);
          });
        });
    }
  } catch (error) {
    const dataToWrite = `[TICKET ERROR] : ${new Date().toLocaleString()} ============> ${error} \n`;
    fs.appendFileSync(logFilePath, dataToWrite, (err) => {
      if (err) throw err;
      console.log(`Error : ${error}`.red.inverse);
    });
  }
};
