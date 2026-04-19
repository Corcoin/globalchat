const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));

let clients = [];

// 🧠 store chat history
let messages = [];

function randomName() {
    return "user_" + Math.floor(Math.random() * 10000);
}

wss.on("connection", (ws) => {
    ws.username = randomName();
    clients.push(ws);

    // ✅ send old messages to new user
    messages.forEach(msg => {
        ws.send(msg);
    });

    // join message
    const joinMsg = `🔵 ${ws.username} joined the chat`;
    addMessage(joinMsg);

    ws.on("message", (msg) => {
        const message = `💬 ${ws.username}: ${msg.toString()}`;
        addMessage(message);
    });

    ws.on("close", () => {
        clients = clients.filter(c => c !== ws);
        const leaveMsg = `🔴 ${ws.username} left the chat`;
        addMessage(leaveMsg);
    });
});

function addMessage(message) {
    // store history
    messages.push(message);

    // optional limit (prevents memory crash)
    if (messages.length > 200) {
        messages.shift();
    }

    // broadcast
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

server.listen(3600, () => {
    console.log("Chat running on http://localhost:3600");
});
