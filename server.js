import { WebSocketServer, WebSocket } from "ws";
import fs from "fs";
import { randomUUID } from "crypto";

const server = new WebSocketServer({ port: 8080 });
const clients = new Map();

server.on("connection", function connection(ws) {
  const clientId = randomUUID();
  clients.set(clientId, ws);
  console.log("Client connected with ID:", clientId);

  ws.on("close", () => {
    console.log("Client with ID", clientId, "has disconnected.");
    clients.delete(clientId);
  });

  ws.on("error", (error) => console.error("WebSocket error:", error));

  ws.on("message", function incoming(message) {
    try {
      const messageObject = parseMessage(message);
      if (messageObject) {
        handleIncomingMessage(messageObject, clientId);
      }
    } catch (error) {
      console.error("Error processing message from ID:", clientId, ":", error);
    }
  });
});

function parseMessage(message) {
  if (typeof message === "string" || message instanceof Buffer) {
    const messageText = message.toString();
    return JSON.parse(messageText);
  } else {
    console.log("Unsupported message type");
    return null;
  }
}

function handleIncomingMessage(messageObject, senderId) {
  const { name, message: text } = messageObject;
  const outgoingMessage = JSON.stringify({ senderId, name, message: text });
  console.log("Received message from ID:", senderId, ":", messageObject);

  clients.forEach((client, id) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(outgoingMessage);
      console.log("Sent message to client ID:", id);
    }
  });

  // Optionally send messages to a designated monitor client
  const monitorId = "monitor_id"; // Adjust as necessary
  const monitor = clients.get(monitorId);
  if (monitor && monitor.readyState === WebSocket.OPEN) {
    monitor.send(outgoingMessage);
    console.log("Sent message to monitor ID:", monitorId);
  }
}

console.log("Server is running on port 8080");
