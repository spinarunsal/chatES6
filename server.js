import { WebSocketServer, WebSocket } from "ws";
import fs from "fs";
import { randomUUID } from "crypto"; // Node.js'in crypto modülünden randomUUID fonksiyonunu import ediyoruz

const server = new WebSocketServer({ port: 8080 });
const clients = new Map(); // Bağlantıları ve ilgili ID'leri saklamak için bir Map kullanıyoruz

server.on("connection", function connection(ws) {
  const clientId = randomUUID(); // Yeni bir bağlantı için benzersiz bir ID oluştur
  clients.set(clientId, ws); // WebSocket bağlantısını ve ID'yi Map'e kaydet
  console.log("Client connected with ID:", clientId);

  ws.on("close", () => {
    console.log("Client with ID", clientId, "has disconnected.");
    clients.delete(clientId); // Bağlantı kapandığında ID'yi ve WebSocket'i Map'ten sil
  });

  ws.on("error", (error) => console.error("WebSocket error:", error));

  ws.on("message", function incoming(message) {
    try {
      if (typeof message === "string") {
        console.log("Received text data from ID:", clientId);
        const messageObject = JSON.parse(message);
        handleIncomingMessage(messageObject, clientId);
      } else if (message instanceof Buffer) {
        console.log(
          "Received binary data from ID:",
          clientId,
          ", converting to text"
        );
        const messageText = message.toString();
        const messageObject = JSON.parse(messageText);
        handleIncomingMessage(messageObject, clientId);
      } else {
        console.log("Unsupported message type from ID:", clientId);
      }
    } catch (error) {
      console.error("Error processing message from ID:", clientId, ":", error);
    }
  });

  function handleIncomingMessage(messageObject, senderId) {
    const { name, message: text } = messageObject;
    const outgoingMessage = JSON.stringify({ senderId, name, message: text });

    console.log("Received message from ID:", senderId, ":", messageObject);

    clients.forEach((client, id) => {
      if (client.readyState === WebSocket.OPEN) {
        // Burada WebSocket sınıfına ihtiyaç duymadan doğrudan bağlantının durumunu kontrol ediyoruz
        client.send(outgoingMessage);
        console.log("Sent message to client ID:", id);
      }
    });
  }

  function logMessage(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${JSON.stringify(message)}\n`;
    fs.appendFile("chatlog/chat.log", logEntry, (err) => {
      if (err) console.error("Error writing to log file:", err);
    });
  }
});

console.log("Server is running on port 8080");

console.log("Server is running on port 8080");

function logMessage(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${JSON.stringify(message)}\n`;
  fs.appendFile("chatlog/chat.log", logEntry, (err) => {
    if (err) console.error("Error writing to log file:", err);
  });
}
