const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

// Membuat instance server WebSocket
const wss = new WebSocket.Server({ server });

const clients = new Set();

// Menangani koneksi WebSocket
wss.on("connection", (ws) => {
  console.log("Koneksi WebSocket baru.");

  // Menambahkan koneksi baru ke set clients
  clients.add(ws);

  // Menangani pesan yang diterima dari klien
  ws.on("message", (message) => {
    console.log(`Pesan diterima: ${message}`);

    if (typeof message !== "string") {
      // Jika pesan bukan dalam bentuk teks, konversi ke teks
      message = message.toString();
    }

    // Mengirim pesan ke semua koneksi aktif (client lainnya)
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Menangani penutupan koneksi WebSocket
  ws.on("close", () => {
    console.log("Koneksi WebSocket ditutup.");

    // Hapus koneksi yang ditutup dari set clients
    clients.delete(ws);
  });
});

// Menjalankan server Express di port tertentu
const port = 5000;
server.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
