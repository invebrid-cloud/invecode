import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

const clients = new Map(); // userId -> Set<ws>
const adminClients = new Set();

let wss;

export function initWebSocket(server) {
    wss = new WebSocketServer({ server });

    wss.on("connection", (ws, req) => {
        try {
            const params = new URLSearchParams(req.url.replace("/?", ""));
            const token = params.get("token");

            if (!token) {
                ws.close();
                return;
            }

            const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
            const userId = String(decoded.id);
            const role = decoded.role;

            if (role === "admins") {
                adminClients.add(ws);
                console.log("Admin WS Connected");

                ws.on("close", () => {
                    adminClients.delete(ws);
                    console.log("Admin WS disconnected");
                });

                return;
            }

            if (!clients.has(userId)) {
                clients.set(userId, new Set());
            }

            clients.get(userId).add(ws);

            console.log("WS Connected:", userId);

            ws.on("close", () => {
                clients.get(userId)?.delete(ws);

                if (clients.get(userId)?.size === 0) {
                    clients.delete(userId);
                }

                console.log("WS disconnected:", userId);
            });

        } catch (err) {
            ws.close();
        }
    });
}

export function sendNotificationToUser(userId, notification) {
    const userSockets = clients.get(String(userId));

    if (!userSockets) return;

    for (const socket of userSockets) {
        if (socket.readyState === 1) {
            socket.send(JSON.stringify({
                type: "NEW_NOTIFICATION",
                notification
            }));
        }
    }
}

export function sendToUser(userId, payload) {
    const userSockets = clients.get(String(userId));
    if (!userSockets) return;

    for (const socket of userSockets) {
        if (socket.readyState === 1) {
            socket.send(JSON.stringify(payload));
        }
    }
}

export function sendToAdmins(payload) {
    for (const socket of adminClients) {
        if (socket.readyState === 1) {
            socket.send(JSON.stringify(payload));
        }
    }
}