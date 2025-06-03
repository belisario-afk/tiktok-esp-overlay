// --- Configuration ---
const DEFAULT_CONFIG = {
  fadeTime: 4000,
  espColor: "#2228ff",
  randomPos: true
};

function getConfig() {
  return {
    ...DEFAULT_CONFIG,
    ...JSON.parse(localStorage.getItem("espOverlayConfig") || "{}"),
  };
}
function setConfig(cfg) {
  localStorage.setItem("espOverlayConfig", JSON.stringify(cfg));
}

// --- Config UI Handling ---
const form = document.getElementById("config-form");
const toggleBtn = document.getElementById("config-toggle");
const configPanel = document.getElementById("config-panel");

function updateFormFields(cfg) {
  form.fadeTime.value = cfg.fadeTime;
  form.espColor.value = cfg.espColor;
  form.randomPos.checked = cfg.randomPos;
}
toggleBtn.onclick = () => {
  form.style.display = form.style.display === "flex" ? "none" : "flex";
  if (form.style.display === "flex") updateFormFields(getConfig());
};
form.onsubmit = (e) => {
  e.preventDefault();
  const cfg = {
    fadeTime: +form.fadeTime.value,
    espColor: form.espColor.value,
    randomPos: form.randomPos.checked
  };
  setConfig(cfg);
  form.style.display = "none";
};

// --- Overlay Logic ---
const wsProto = location.protocol === "https:" ? "wss" : "ws";
const ws = new WebSocket(`${wsProto}://${location.host}/ws`);
const canvas = document.getElementById('esp-canvas');
const ctx = canvas.getContext('2d');
let objects = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  if (data.type === "donation") {
    spawnESPObject(data);
  }
};

function spawnESPObject({ name, profilePic, giftName, repeatCount }) {
  const cfg = getConfig();
  let x = canvas.width / 2, y = canvas.height / 3;
  if (cfg.randomPos) {
    x = Math.random() * (canvas.width - 120) + 60;
    y = Math.random() * (canvas.height - 120) + 60;
  }
  objects.push({
    x, y, name, profilePic, giftName, repeatCount,
    createdAt: Date.now(),
    alpha: 1.0
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const now = Date.now();
  const cfg = getConfig();
  objects = objects.filter(obj => {
    obj.alpha = 1 - ((now - obj.createdAt) / cfg.fadeTime);
    if (obj.alpha <= 0) return false;
    drawESP(obj, cfg);
    return true;
  });
  requestAnimationFrame(draw);
}
draw();

function drawESP(obj, cfg) {
  ctx.save();
  ctx.globalAlpha = Math.max(obj.alpha, 0);

  // Draw circle background
  ctx.beginPath();
  ctx.arc(obj.x, obj.y, 40, 0, 2 * Math.PI);
  ctx.fillStyle = cfg.espColor + "cc"; // add alpha
  ctx.fill();

  // Draw profile picture
  const img = new window.Image();
  img.onload = () => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(obj.x, obj.y, 36, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, obj.x - 36, obj.y - 36, 72, 72);
    ctx.restore();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(obj.x, obj.y, 36, 0, 2 * Math.PI);
    ctx.stroke();
  };
  img.src = obj.profilePic || "assets/placeholder.png";

  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.fillText(obj.name, obj.x, obj.y + 56);

  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#ff0";
  ctx.fillText(`${obj.giftName} x${obj.repeatCount}`, obj.x, obj.y + 76);

  ctx.restore();
}