import axios from "axios";

// Define your iTop REST API endpoint
const itopEndpoint =
  "http://localhost:8080/iTop-3.1.1-1-12561/web/webservices/rest.php?version=1.0";

// Encode your iTop credentials (username and password) for basic authentication
const username = "admin";
const password = "123456";
const credentials = Buffer.from(`${username}:${password}`).toString("base64");

// Define the JSON data for creating a new ticket
const ticketData = {
  operation: "core/create",
  class: "UserRequest",
  comment: "Initial ticket creation comment.",
  fields: {
    title: "Network Issue",
    description: "User reports slow internet connection.",
    caller_id: "2",
    impact: "2", // High
    urgency: "2", // High
    priority: "2", // High
    status: "new",
    // category: "network",
    org_id: "2",
    agent_id: "1",
  },
};

// Make a POST request to create the ticket
axios
  .post(
    itopEndpoint,
    { json_data: JSON.stringify(ticketData) },
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  )
  .then((response) => {
    console.log("Ticket created successfully:", response.data);
  })
  .catch((error) => {
    console.error("Error creating ticket:", error.response.data);
  });
