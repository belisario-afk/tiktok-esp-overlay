[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/belisario-afk/tiktok-esp-overlay)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/belisario-afk/tiktok-esp-overlay)

# TikTok ESP Overlay

A web overlay for OBS that displays TikTok Live donators as "ESP objects" (like wallhack overlays).

## Features

- Listens to TikTok Live gifts/donations in real time
- Displays donator profile pic and name as floating objects
- Overlay is transparent, works as a browser source in OBS
- Built-in config panel (⚙️)

---

## 🚀 One-Click Deploy

Deploy to [Render](https://render.com/) or [Railway](https://railway.app/) with one click:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/belisario-afk/tiktok-esp-overlay)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/belisario-afk/tiktok-esp-overlay)

After clicking, set your `TIKTOK_USERNAME` to `lmohss` if it's not already prefilled.

---

## Local Development

```bash
git clone https://github.com/belisario-afk/tiktok-esp-overlay.git
cd tiktok-esp-overlay
cp .env.example .env   # already set for lmohss
npm install
npm start
```
- Overlay served at [http://localhost:8080](http://localhost:8080)

---

## Usage with OBS

- Add a **Browser** source in OBS.
- URL: your deployed app's URL or `http://localhost:8080/` for local use.
- Set width/height to your stream resolution (e.g., 1920×1080).
- Background is transparent by default.

---

## Customization

- Click the ⚙️ icon (top right) to open config panel (fade-out, color, etc.)
- All settings saved in your browser.

---

## Security

- Do **not** share your backend URL publicly.
- For production, restrict access by IP or add password/auth if needed.

---

## License

MIT
