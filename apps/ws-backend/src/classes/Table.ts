import { Deck, Card } from "./Deck";
import { Player } from "./Player";
import { HandEvaluator } from "./HandEvaluator";

export class Table {
    public id: string;
    public players: Player[];
    public pot: number;
    public deck: Deck;
    public communityCards: Card[];
    public currentTurn: number; // Index of player
    public smallBlind: number;
    public bigBlind: number;
    public isActive: boolean;
    public turnTimer: any; // Timer reference
    public minBet: number;
    public turnStartTime: number;

    constructor(id: string, smallBlind: number) {
        this.id = id;
        this.players = [];
        this.pot = 0;
        this.deck = new Deck();
        this.communityCards = [];
        this.currentTurn = 0;
        this.smallBlind = smallBlind;
        this.bigBlind = smallBlind * 2;
        this.isActive = false;
        this.minBet = this.bigBlind;
        this.stage = 'pre-flop';
        this.turnStartTime = 0;
    }

    addPlayer(player: Player) {
        const existingPlayer = this.players.find(p => p.id === player.id);
        if (existingPlayer) {
            existingPlayer.connection = player.connection;
            existingPlayer.isActive = true; // Mark active on reconnect? Or just update socket?
            this.broadcastState();
            return;
        }

        if (this.players.length >= 6) return; // Cap at 6 for now
        this.players.push(player);
        this.broadcast({ type: "PLAYER_JOINED", player: { id: player.id, name: player.name, balance: player.balance } });

        // Auto-start if 2+ players and not active (for MVP)
        if (this.players.length >= 2 && !this.isActive) {
            this.broadcast({ type: "GAME_STARTING", message: "Game starting in 5 seconds..." });
            setTimeout(() => this.startGame(), 5000);
        }
        this.broadcastState();
    }

    removePlayer(playerId: string) {
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return;

        // If it was this player's turn, we need to move turn before removing (or handle after)
        // If we remove index Y, and currentTurn < Y, currentTurn stays same
        // If we remove index Y, and currentTurn > Y, currentTurn--
        // If we remove index Y, and currentTurn == Y, we need next turn

        const isTurn = playerIndex === this.currentTurn;

        this.players = this.players.filter(p => p.id !== playerId);

        this.broadcast({ type: "PLAYER_LEFT", playerId });

        if (this.players.length < 2) {
            this.isActive = false;
            // Refund pot etc mechanism needed here (simplified: game ends)
        } else {
            if (this.currentTurn > playerIndex) {
                this.currentTurn--;
            } else if (isTurn) {
                // It was their turn. Timer should be cancelled and next turn invoked.
                clearTimeout(this.turnTimer);

                // currentTurn now points to the *next* person (because array shifted left)
                // But we need to ensure valid index
                if (this.currentTurn >= this.players.length) {
                    this.currentTurn = 0;
                }
                // And verifying they are active
                // We can just call nextTurn logic, but nextTurn relies on 'currentTurn' being the *completed* turn usually
                // Let's manually trigger next active search
                let loops = 0;
                while (!this.players[this.currentTurn].isActive && loops < this.players.length) {
                    this.currentTurn = (this.currentTurn + 1) % this.players.length;
                    loops++;
                }
                this.startTurnTimer();
            }
            this.broadcastState();
        }
    }

    broadcast(message: any) {
        this.players.forEach(p => p.send(message));
    }

    startGame() {
        if (this.players.length < 2) return;
        this.isActive = true;
        this.deck.reset();
        this.deck.shuffle();
        this.communityCards = [];
        this.pot = 0;
        this.stage = 'pre-flop';
        this.minBet = this.bigBlind;

        // Reset players
        this.players.forEach(p => {
            p.isActive = true;
            p.hand = [this.deck.draw()!, this.deck.draw()!];
            p.currentBet = 0;
            // Don't send DEAL here, rely on broadcastState for simplicity or send specific
            // p.send({ type: "DEAL", hand: p.hand }); 
        });

        // Blinds (simplified: P0 SB, P1 BB) - in real game dealer button moves
        this.players[0].balance -= this.smallBlind;
        this.players[0].currentBet = this.smallBlind;
        this.players[1].balance -= this.bigBlind;
        this.players[1].currentBet = this.bigBlind;
        this.pot = this.smallBlind + this.bigBlind;

        this.currentTurn = 2 % this.players.length; // Next player after BB
        this.startTurnTimer();
        this.broadcastState();
    }

    startTurnTimer() {
        if (this.turnTimer) clearTimeout(this.turnTimer);
        const currentPlayer = this.players[this.currentTurn];
        this.turnStartTime = Date.now(); // CRITICAL: Set timestamp for frontend timer

        this.broadcast({ type: "TURN_CHANGE", playerId: currentPlayer.id, timeLeft: 30 });

        this.turnTimer = setTimeout(() => {
            // Auto fold if timeout
            this.handleAction(currentPlayer.id, { type: "FOLD" });
        }, 30000);
    }

    handleAction(playerId: string, action: { type: string, amount?: number }) {
        console.log(`handleAction: ${playerId} wants to ${action.type}`);
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) {
            console.error("Player not found in table");
            return;
        }

        if (playerIndex !== this.currentTurn) {
            console.error(`Not ${playerId}'s turn. Current turn index: ${this.currentTurn} (${this.players[this.currentTurn]?.id})`);
            return;
        }

        const player = this.players[playerIndex];

        if (action.type === "FOLD") {
            player.isActive = false;
        } else if (action.type === "CALL") {
            const amountToCall = this.minBet - player.currentBet;
            if (amountToCall > player.balance) {
                // All-in scenario
                const contribution = player.balance;
                player.balance = 0;
                player.currentBet += contribution;
                this.pot += contribution;
            } else {
                player.balance -= amountToCall;
                player.currentBet += amountToCall;
                this.pot += amountToCall;
            }
        } else if (action.type === "RAISE") {
            const amount = action.amount || 0;
            // Interpret amount as "Raise To (Total Bet)"
            // If amount is less than minBet, it might be an invalid raise.
            // BUT, if the player is going all-in, it might be less than minBet but their max.

            // Calculate how much MORE they are putting in
            const added = amount - player.currentBet;

            if (added <= 0) {
                console.error("Invalid raise: amount must be greater than current bet");
                return;
            }

            if (added > player.balance) {
                console.error("Insufficient funds to raise");
                // Optional: Auto-adjust to all-in?
                // For now, strict reject to avoid confusion, or treat as all-in?
                // Let's return to prevent negative balance.
                return;
            }

            // Valid raise
            player.balance -= added;
            player.currentBet = amount;
            this.pot += added;
            this.minBet = amount;
        }

        console.log(`Action applied. New Balance: ${player.balance}. Current Bet: ${player.currentBet}. Pot: ${this.pot}`);

        // Move turn
        this.nextTurn();
    }

    nextTurn() {
        clearTimeout(this.turnTimer);
        // Find next active player
        let nextIndex = (this.currentTurn + 1) % this.players.length;
        let loops = 0;
        while (!this.players[nextIndex].isActive && loops < this.players.length) {
            nextIndex = (nextIndex + 1) % this.players.length;
            loops++;
        }

        // Check if round should end (everyone called or folded)
        // Simplified Logic: if we are back to the player who matched minBet and everyone acted
        // For MVP, just checking if everyone matches bits is hard in this generic loop.
        // We will just do a simple pass: if all active players have bet == minBet, go to next stage

        const activePlayers = this.players.filter(p => p.isActive);
        if (activePlayers.length === 1) {
            this.endGame(activePlayers[0]);
            return;
        }

        const everyoneMatched = activePlayers.every(p => p.currentBet === this.minBet);
        // Also need to ensure everyone has had a chance: verifying that turn circled back is complex 
        // without a 'lastRaiser' tracker. For now, let's assume if everyone matched && currentTurn != lastRaiser...
        // Let's rely on client state mostly for MVP or improve logic later.

        // Let's implement Next Stage logic if everyone matches
        if (everyoneMatched && this.currentTurn === this.players.length - 1) {
            this.nextStage();
        } else {
            this.currentTurn = nextIndex;
            this.startTurnTimer();
            this.broadcastState();
        }
    }

    nextStage() {
        this.players.forEach(p => p.currentBet = 0); // Reset round bets (but keep money in pot)
        this.minBet = 0;

        if (this.stage === 'pre-flop') {
            this.stage = 'flop';
            this.communityCards.push(this.deck.draw()!, this.deck.draw()!, this.deck.draw()!);
        } else if (this.stage === 'flop') {
            this.stage = 'turn';
            this.communityCards.push(this.deck.draw()!);
        } else if (this.stage === 'turn') {
            this.stage = 'river';
            this.communityCards.push(this.deck.draw()!);
        } else if (this.stage === 'river') {
            this.stage = 'showdown';
            this.determineWinner();
            return;
        }

        this.currentTurn = 0; // SB starts
        // Find first active
        while (!this.players[this.currentTurn].isActive) {
            this.currentTurn = (this.currentTurn + 1) % this.players.length;
        }
        this.startTurnTimer();
        this.broadcastState();
    }

    determineWinner() {
        let bestHandValue = -1;
        let winner: Player | null = null;

        const activePlayers = this.players.filter(p => p.isActive);
        // Showdown: Stage is already set in nextStage, but ensure we broadcast state
        this.broadcastState();

        activePlayers.forEach(p => {
            const result = HandEvaluator.evaluate(p.hand, this.communityCards);
            if (result.value > bestHandValue) {
                bestHandValue = result.value;
                winner = p;
            }
        });

        if (winner) {
            (winner as Player).balance += this.pot;
            this.broadcast({ type: "GAME_OVER", winnerId: (winner as Player).id, amount: this.pot });
        }

        // Wait 8 seconds before restarting so users can see the winner
        setTimeout(() => this.startGame(), 8000);
    }

    endGame(winner: Player) {
        winner.balance += this.pot;
        this.broadcast({ type: "GAME_OVER", winnerId: winner.id, amount: this.pot, reason: "Fold" });
        setTimeout(() => this.startGame(), 5000);
    }

    broadcastState() {
        // Send personalized state to each player
        this.players.forEach(player => {
            player.send({
                type: "GAME_STATE",
                pot: this.pot,
                communityCards: this.communityCards,
                players: this.players.map(p => ({
                    id: p.id,
                    name: p.name,
                    balance: p.balance,
                    currentBet: p.currentBet,
                    isActive: p.isActive,
                    isTurn: this.players[this.currentTurn]?.id === p.id
                })),
                myHand: player.hand, // Important: Send private cards only to the owner
                currentTurn: this.players[this.currentTurn]?.id || "",
                minBet: this.minBet,
                smallBlind: this.smallBlind,
                bigBlind: this.bigBlind,
                stage: this.stage,
                turnStartTime: this.turnStartTime
            });
        });
    }
}
