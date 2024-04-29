import { Server, OPEN } from "ws";
const server = new Server({ port: 8080 });

server.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
    server.clients.forEach((client) => {
      if (client.readyState === OPEN) {
        client.send(message.toString()); // String olarak gönder
      }
    });
  });

  ws.on("close", () => {
    console.log("Client has disconnected");
  });
});

console.log("Server is running on port 8080");
