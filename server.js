import { WebSocketServer, WebSocket } from "ws";
import fs from "fs";

const server = new WebSocketServer({ port: 8080 });

server.on("connection", function connection(ws) {
  console.log("Client connected");

  ws.on("message", function incoming(message) {
    try {
      let messageObject;
      if (!message instanceof Buffer) {
        console.log("Received binary data");
        // İşlemi durdur
        return;
      } else {
        console.log("NOT Received binary data");
        messageObject = JSON.parse(message);
      }

      const { name, message: text } = messageObject;

      // Gelen mesajı diğer istemcilere iletilmek üzere yeniden düzenle
      const outgoingMessage = JSON.stringify({ name, message: text });

      // Tüm istemcilere gelen mesajı ilet
      server.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(outgoingMessage);
          console.log("outgoingMessage", outgoingMessage);
        }
      });

      // Gelen mesajı günlüğe kaydet
      console.log("logMessage:", messageObject);
      logMessage(messageObject);
    } catch (error) {
      console.error("Error processing incoming message:", error);
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
