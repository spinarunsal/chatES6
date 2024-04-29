import { WebSocketServer, WebSocket } from "ws";
import fs from "fs";

const server = new WebSocketServer({ port: 8080 });

server.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    console.log(`Received: ${message}`); // Logs the raw message content
    console.log("Going to logMessage");
    logMessage(message);

    try {
      // Assuming that the message is a JSON string that needs to be parsed
      const parsedMessage = JSON.parse(message);
      console.log("Message to send:", JSON.stringify(parsedMessage)); // Log how it looks after parsing and re-stringification

      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedMessage)); // Send the parsed and re-stringified message
        }
      });
    } catch (error) {
      console.error("Failed to parse message:", message, error);
    }
  });

  ws.on("close", () => {
    console.log("Client has disconnected");
  });
});

function logMessage(message) {
  const timestamp = new Date().toISOString();
  const messageStr =
    typeof message === "string" ? message : JSON.stringify(message); // Handle object messages
  const logEntry = `${timestamp} - ${messageStr}\n`;
  console.log("Current working directory:", process.cwd());

  fs.appendFile("chat.log", logEntry, (err) => {
    if (err) {
      console.error("Error writing to log file", err);
    }
  });
}

console.log("Server is running on port 8080");
