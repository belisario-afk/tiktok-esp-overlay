import express from "express";
import { WebSocketServer } from "ws";
import { WebcastPushConnection } from "tiktok-live-connector";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// --- Load environment variables ---
dotenv.config();
const PORT = process.env.PORT || 8080;
const TIKTOK_USERNAME = process.env.TIKTOK_USERNAME || "lmohss";
if (!TIKTOK_USERNAME) {
  console.error("Error: Please set TIKTOK_USERNAME in .env or Railway/Render environment variables");
  process.exit(1);
}

// --- Express setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// Health check for cloud hosts
app.get("/healthz", (req, res) => res.send("OK"));

// --- HTTP Server ---
const server = app.listen(PORT, () => {
  console.log(`[TikTok-ESP] Web server running at http://localhost:${PORT}/`);
});

// --- WebSocket Server on /ws ---
const wss = new WebSocketServer({ server, path: "/ws" });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
  ws.send(JSON.stringify({ type: "init", data: "Connected to TikTok ESP backend." }));
});

// --- TikTok Live Listener ---
const tiktok = new WebcastPushConnection(TIKTOK_USERNAME);

tiktok.connect().then(state => {
  console.log(`[TikTok-ESP] Connected to TikTok Live as @${TIKTOK_USERNAME} (roomId ${state.roomId})`);
}).catch(err => {
  console.error("[TikTok-ESP] Failed to connect to TikTok:", err);
  process.exit(1);
});

tiktok.on("gift", data => {
  const donationEvent = {
    type: "donation",
    userId: data.userId,
    name: data.uniqueId,
    profilePic: data.profilePictureUrl || "",
    giftName: data.giftName,
    repeatCount: data.repeatCount,
    timestamp: Date.now()
  };
  for (const ws of clients) {
    ws.send(JSON.stringify(donationEvent));
  }
  console.log(`[TikTok] ${donationEvent.name} sent ${donationEvent.giftName}`);
});