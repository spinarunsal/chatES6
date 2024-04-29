const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 8080 });

server.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
    // Tüm bağlı client'lara mesajı gönder
    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString()); // Mesajı string olarak gönder
      }
    });
  });

  ws.on("close", () => {
    console.log("Client has disconnected");
  });
});

console.log("Server is running on port 8080");
