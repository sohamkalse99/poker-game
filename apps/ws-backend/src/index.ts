import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { UserManager } from "./UserManager";
import { GameManager } from "./GameManager";

const PORT = Number(process.env.PORT) || 8080;
const wss = new WebSocketServer({ port: PORT });
const userManager = new UserManager();
const gameManager = new GameManager();

wss.on("connection", (ws, req) => {
    const url = req.url;
    if (!url) {
        ws.close();
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token');

    if (!token) {
        ws.close();
        return;
    }

    // TODO: Verify token with JWT_SECRET from config
    // In real app: const decoded = jwt.verify(token, process.env.JWT_SECRET)

    ws.on("error", console.error);

    ws.on("message", (data) => {
        try {
            const message = JSON.parse(data.toString());
            gameManager.handleMessage(ws, message);
        } catch (e) {
            console.error("Error handling message", e);
        }
    });

    ws.on("close", () => {
        gameManager.handleDisconnect(ws);
    });

    ws.send("Connected to Poker WebSocket Server");
});

console.log("WS Server running on port 8080");
