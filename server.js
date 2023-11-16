const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./capstonec04-c3cfc-firebase-adminsdk-uh2o4-9cd7371be2.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());

const firestore = admin.firestore();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const clients = new Set();

wss.on("connection", async (ws, req) => {
  const clientIp = req.connection.remoteAddress;
  console.log(`Koneksi WebSocket baru dari ${clientIp}.`);
  clients.add(ws);

  // Memeriksa apakah dokumen dengan nama clientIp sudah ada dalam koleksi "test-device"
  const deviceDoc = await firestore
    .collection("test-device")
    .doc(clientIp)
    .get();

  if (!deviceDoc.exists) {
    console.log(
      `Dokumen dengan nama ${clientIp} belum ada. Menambahkan dokumen.`
    );

    // Menambahkan dokumen pada koleksi "test-device" jika belum ada
    const deviceCollection = firestore.collection("test-device").doc(clientIp);

    // Mengatur bidang (field) pada dokumen
    await deviceCollection.set({
      name: "",
      wid: "",
      gender: 0,
    });
  } else {
    console.log(`Dokumen dengan nama ${clientIp} sudah ada.`);
  }

  ws.on("message", async (message) => {
    console.log(`Pesan diterima: ${message}`);

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

    firestore.collection("pulse-data").doc(`${clientIp}`).add(data);

    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log(`Koneksi WebSocket dari ${clientIp} ditutup.`);
    clients.delete(ws);
  });
});

const port = 5000;
server.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
