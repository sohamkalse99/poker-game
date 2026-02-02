import { WebSocket } from "ws";

export class Player {
    public id: string;
    public name: string;
    public balance: number;
    public hand: any[]; // [Card, Card]
    public currentBet: number;
    public isActive: boolean; // Has not folded
    public isSittingOut: boolean;
    public connection?: WebSocket;

    constructor(id: string, name: string, balance: number, connection?: WebSocket) {
        this.id = id;
        this.name = name;
        this.balance = balance;
        this.hand = [];
        this.currentBet = 0;
        this.isActive = true;
        this.isSittingOut = false;
        this.connection = connection;
    }

    send(message: any) {
        if (this.connection) {
            this.connection.send(JSON.stringify(message));
        }
    }
}
