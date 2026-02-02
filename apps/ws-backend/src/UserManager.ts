import { WebSocket } from "ws";

export class UserManager {
    private users: Map<string, WebSocket>;

    constructor() {
        this.users = new Map();
    }

    addUser(userId: string, ws: WebSocket) {
        this.users.set(userId, ws);
    }

    removeUser(userId: string) {
        this.users.delete(userId);
    }

    getUser(userId: string) {
        return this.users.get(userId);
    }
}
