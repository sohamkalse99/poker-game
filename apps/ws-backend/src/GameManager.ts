import { WebSocket } from "ws";
import { Table } from "./classes/Table";
import { Player } from "./classes/Player";

export class GameManager {
    private tables: Map<string, Table>;

    constructor() {
        this.tables = new Map();
    }

    createTable(id: string, smallBlind: number) {
        this.tables.set(id, new Table(id, smallBlind));
    }

    getTable(id: string) {
        return this.tables.get(id);
    }

    handleMessage(ws: WebSocket, message: any) {
        const { type, payload } = message;
        console.log("Received message:", type, payload);

        // Simplify: Assume we know the user from WS context (not implemented fully here for MVP)
        // In real app, we map WS -> UserId -> Player
        // Here we'll expect userId in payload for demo

        if (type === "JOIN_TABLE") {
            let table = this.tables.get(payload.tableId);
            if (!table) {
                console.log(`Table ${payload.tableId} not found, creating new table locally...`);
                // Create table if it doesn't exist. Defaulting smallBlind to 50 for now.
                // In production, we should probably fetch from DB or have a central coordinator.
                this.createTable(payload.tableId, 50);
                table = this.tables.get(payload.tableId);
            }

            if (table) {
                // Mock user data or fetch from DB
                const newPlayer = new Player(payload.userId, payload.username || "User", 1000, ws);
                table.addPlayer(newPlayer);
            }
        }
        else if (type === "ACTION") {
            const table = this.tables.get(payload.tableId);
            if (table) {
                table.handleAction(payload.userId, payload.action);
            } else {
                console.error("Table not found for action:", payload.tableId);
            }
        }
    }


    handleDisconnect(ws: WebSocket) {
        // Inefficient lookup, but fine for MVP
        // Ideally we have a map<WebSocket, {tableId, playerId}>
        this.tables.forEach((table) => {
            const player = table.players.find(p => p.connection === ws);
            if (player) {
                console.log(`Player ${player.id} disconnected`);
                table.removePlayer(player.id);
            }
        });
    }
}
