import express from 'express';
import { config } from 'dotenv';
import { WebSocketServer } from 'ws';
// Import TikTokLiveConnector if you use it
import { TikTokLiveConnector } from 'tiktok-live-connector';

config();

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files (your overlay) from the 'public' folder
app.use(express.static('public'));

// Optional: If someone goes to '/', serve index.html or show a message
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' }, (err) => {
    if (err) {
      res.send('TikTok ESP Overlay is running! Place your index.html in the public folder.');
    }
  });
});

// Start the HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Set up WebSocket server on the same HTTP server (for overlay communication)
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Overlay connected via WebSocket!');
  // Example: send a hello message
  ws.send(JSON.stringify({ type: 'hello', message: 'Welcome to the TikTok ESP Overlay!' }));
});

// TikTokLiveConnector usage (if needed)
if (process.env.TIKTOK_USERNAME) {
  const connector = new TikTokLiveConnector({ uniqueId: process.env.TIKTOK_USERNAME });

  connector.connect();

  connector.on('gift', (data) => {
    // Broadcast gift event to all connected overlays
    const message = JSON.stringify({ type: 'gift', data });
    wss.clients.forEach((client) => {
      if (client.readyState === 1) client.send(message);
    });
  });

  connector.on('connect', () => console.log('Connected to TikTok Live!'));
  connector.on('disconnect', () => console.log('Disconnected from TikTok Live.'));
} else {
  console.log('Warning: TIKTOK_USERNAME is not set in environment variables!');
}