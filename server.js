const admin = require("firebase-admin");
const serviceAccount = require("./capstonec04-c3cfc-firebase-adminsdk-uh2o4-9cd7371be2.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();
const WebSocket = require("ws");
const http = require("http");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const clients = new Set();

const ipv4Regex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

wss.on("connection", async (ws, req) => {
  let clientIp = req.connection.remoteAddress;
  console.log(`New WebSocket connection from ${clientIp}.`);
  clients.add(ws);

  if (clientIp.startsWith("::ffff:")) {
    clientIp = clientIp.substring(7);
  }

  const isLocalhost = clientIp === "::1" || clientIp === "127.0.0.1";

  const deviceDoc = await firestore
    .collection("test-device")
    .doc(clientIp)
    .get();

  if (!deviceDoc.exists) {
    if (isLocalhost || ipv4Regex.test(clientIp)) {
      console.log(
        `Document with name ${clientIp} does not exist. Adding document.`
      );

      const deviceCollection = firestore
        .collection("test-device")
        .doc(clientIp);

      await deviceCollection.set({
        name: "",
        wid: "",
        gender: 0,
      });
    } else {
      console.log(`Create document error.`);
    }
  } else {
    console.log(`Document with name ${clientIp} already exists.`);
  }

  ws.on("message", async (message) => {
    if (typeof message !== "string") {
      message = message.toString();
    }

    let data;
    try {
      data = JSON.parse(message);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return;
    }

    // Generate a timestamp and use it as the document ID
    const timestamp = Math.floor(
      admin.firestore.Timestamp.fromDate(new Date()).toMillis() / 1000
    ).toString();

    data.timestamp = timestamp;

    console.log(`Received message: ${JSON.stringify(data)}`);

    await firestore
      .collection("pulse-data")
      .doc(clientIp)
      .collection("data")
      .doc(timestamp)
      .set(data);

    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data)); // send a JSON string
      }
    });
  });

  ws.on("close", () => {
    console.log(`WebSocket connection from ${clientIp} closed.`);
    clients.delete(ws);
  });
});

const port = 5000;
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
