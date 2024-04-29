import { WebSocketServer, WebSocket } from "ws";
import fs from "fs";

const server = new WebSocketServer({ port: 8080 });

server.on("connection", function connection(ws) {
  console.log("Client connected");

  ws.on("message", function incoming(message) {
    if (message instanceof Buffer) {
      console.log("Received binary data");
      console.log("Received:", message);
      logMessage(message);
    } else {
      console.log("Received:", message);
      const messageObject = JSON.parse(message);
      const { name, message: text } = messageObject;

      // Gelen mesajı diğer istemcilere iletilmek üzere yeniden düzenle
      const outgoingMessage = JSON.stringify({ name, message: text });

      // Tüm istemcilere gelen mesajı ilet
      server.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(outgoingMessage);
        }
      });

      // Gelen mesajı günlüğe kaydet
      logMessage(messageObject);
    }
  });
});

function logMessage(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${JSON.stringify(message)}\n`;

  fs.appendFile("chatlog/chat.log", logEntry, (err) => {
    if (err) {
      console.error("Error writing to log file", err);
    }
  });
}

console.log("Server is running on port 8080");
