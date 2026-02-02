import { useEffect, useState, useRef } from "react";
import { ChevronLeft, Menu, Settings, Trophy } from "lucide-react";

interface GameTableProps {
    tableId: string;
    userId: string;
    token: string;
    onLeave: () => void;
}

export function GameTable({ tableId, userId, token, onLeave }: GameTableProps) {
    const [gameState, setGameState] = useState<any>(null);
    const [betAmount, setBetAmount] = useState(0);
    const [winner, setWinner] = useState<{ name: string, amount: number } | null>(null);
    const ws = useRef<WebSocket | null>(null);


    useEffect(() => {
        if (gameState && gameState.minBet) {
             setBetAmount(gameState.minBet);
        }
        // Reset winner when new game starts
        if (gameState && gameState.stage === 'pre-flop') {
            setWinner(null);
        }
    }, [gameState?.minBet, gameState?.currentTurn, gameState?.stage]);

    // Auto-hide winner overlay after 6 seconds
    useEffect(() => {
        if (winner) {
            const timer = setTimeout(() => {
                setWinner(null);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [winner]);

    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:8080?token=${token}`);
        ws.current = socket;

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "JOIN_TABLE", payload: { tableId, userId, username: userId } }));
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "GAME_STATE") {
                setGameState(message);
            } else if (message.type === "GAME_OVER") {
                const winnerName = message.winnerId === userId ? "You" : (gameState?.players.find((p: any) => p.id === message.winnerId)?.name || message.winnerId);
                setWinner({ name: winnerName, amount: message.amount });
            }
        };

        return () => {
            socket.close();
        }
    }, [tableId, userId]);

    const sendAction = (actionType: string, amount?: number) => {
        if (!ws.current) return;
        ws.current.send(JSON.stringify({
            type: "ACTION",
            payload: {
                tableId,
                userId,
                action: { type: actionType, amount }
            }
        }));
    };

    if (!gameState) return (
        <div className="h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-amber-500 font-serif">
            <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4"></div>
            <div className="tracking-widest text-sm uppercase opacity-80">Connecting to Table...</div>
        </div>
    );

    const myPlayer = gameState.players.find((p: any) => p.id === userId);
    const isMyTurn = gameState.currentTurn === userId;

    return (
        <div className="h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col relative selection:bg-amber-500/30 font-sans">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none"></div>

            {/* Winner Overlay */}
            {winner && (
                 <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center animate-in fade-in duration-500 pointer-events-none">
                     <Trophy className="text-amber-500 w-32 h-32 mb-4 animate-bounce" />
                     <div className="text-4xl font-bold text-white mb-2">
                        {gameState.stage === 'showdown' ? 'Showdown!' : 'Winner!'}
                     </div>
                     <div className="text-slate-400 text-xl">
                        <span className="text-amber-400 font-bold">{winner.name} won ${winner.amount}</span>
                     </div>
                 </div>
            )}

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 pointer-events-none">
                <div className="flex gap-4 pointer-events-auto">
                    <button 
                        onClick={onLeave} 
                        className="group flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors pl-2 pr-4 py-2 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                        <span className="font-medium">Lobby</span>
                    </button>
                </div>
                <div className="flex gap-3 pointer-events-auto">
                    <button className="p-2.5 bg-black/40 border border-white/5 rounded-full text-slate-400 hover:text-amber-500 hover:border-amber-500/30 backdrop-blur transition-all">
                        <Settings size={20} />
                    </button>
                    <button className="p-2.5 bg-black/40 border border-white/5 rounded-full text-slate-400 hover:text-amber-500 hover:border-amber-500/30 backdrop-blur transition-all">
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            {/* Main Table Area */}
            <div className="flex-1 relative flex items-center justify-center perspective-1000 -mt-24">
                
                {/* The Graph/Table */}
                <div className="relative w-[850px] h-[440px] transition-all duration-700">
                    
                    {/* Table Border (Rail) */}
                    <div className="absolute inset-0 rounded-[220px] bg-gradient-to-b from-[#2a2a2a] to-[#111] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_2px_2px_rgba(255,255,255,0.1)] border border-[#333]"> 
                        {/* Gold Trim */}
                        <div className="absolute inset-[-2px] rounded-[222px] bg-gradient-to-b from-amber-600/40 to-transparent -z-10 opacity-50"></div>
                    </div>

                    {/* Table Surface (Felt) */}
                    <div className="absolute inset-[24px] rounded-[200px] bg-[#151515] shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] border border-white/5 flex items-center justify-center overflow-hidden">
                        {/* Felt Texture/Pattern */}
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]"></div>
                        
                        {/* Center Logo */}
                        <div className="opacity-5 select-none pointer-events-none transform scale-150">
                             <Trophy size={120} />
                        </div>

                        {/* Community Cards Area */}
                        {/* ... existing code ... */}
                        <div className="relative z-10 flex gap-3 p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm shadow-xl min-w-[300px] min-h-[140px] items-center justify-center">
                            {gameState.communityCards.length === 0 ? (
                                <div className="text-slate-500/50 font-medium tracking-[0.2em] text-xs uppercase flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                    Waiting for deal
                                </div>
                            ) : (
                                gameState.communityCards.map((c: any, i: number) => (
                                    <Card key={i} rank={c.rank} suit={c.suit} index={i} />
                                ))
                            )}
                        </div>
                    </div>
                    
                    {/* Pot Display */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-28 z-20">
                        <div className="bg-[#0a0a0a]/90 px-5 py-2 rounded-full border border-amber-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.1)] flex items-center gap-3">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Pot</span>
                            <span className="text-amber-400 font-bold font-mono text-lg">${gameState.pot}</span>
                        </div>
                    </div>

                    {/* Players - HIDE SELF */}
                    {gameState.players.map((p: any, i: number) => {
                        if (p.id === userId) return null; // Hide self from table
                        
                        const total = gameState.players.length; 
                        const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
                        const radiusX = 500; 
                        const radiusY = 280;
                        const x = Math.cos(angle) * radiusX;
                        const y = Math.sin(angle) * radiusY;

                        return (
                            <div 
                                key={p.id}
                                className="absolute left-1/2 top-1/2 w-0 h-0"
                                style={{ transform: `translate(${x}px, ${y}px)` }}
                            >
                                <div className="-translate-x-1/2 -translate-y-1/2">
                                     <PlayerAvatar 
                                        player={p} 
                                        isTurn={gameState.currentTurn === p.id} 
                                        turnStartTime={gameState.turnStartTime}
                                     />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Bottom Info & Controls */}
            <div className="bg-[#0f0f0f] border-t border-white/5 p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
                <div className="max-w-5xl mx-auto flex items-end justify-between gap-8">
                    
                    {/* Left: User Info WITH TIMER */}
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            {/* User Timer Ring */}
                            {isMyTurn && (
                                <div className="absolute -inset-4 z-0">
                                    <UserTimer turnStartTime={gameState.turnStartTime} />
                                </div>
                            )}
                            
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center shadow-inner relative z-[5]">
                                <span className="text-xl font-bold text-slate-400 group-hover:text-amber-500 transition-colors">
                                    {userId.substring(0,2).toUpperCase()}
                                </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-[#0f0f0f] rounded-full z-20"></div>
                        </div>
                        <div>
                            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Your Balance</div>
                            <div className="text-3xl text-white font-medium font-mono tracking-tight flex items-baseline gap-1">
                                <span className="text-amber-500 text-xl">$</span>
                                {myPlayer?.balance.toLocaleString() ?? 0}
                            </div>
                        </div>
                    </div>

                    {/* Center: Hand Cards */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-32 flex gap-1 perspective-500 hover:-translate-y-4 transition-transform duration-300 pointer-events-none z-30">
                        {gameState.myHand && gameState.myHand.length > 0 ? (
                            gameState.myHand.map((card: any, i: number) => (
                                <div key={i} className={`transform ${i === 0 ? '-rotate-3 -ml-2' : 'rotate-3'} transition-transform origin-bottom pointer-events-auto shadow-2xl`}>
                                    <Card rank={card.rank} suit={card.suit} index={i} />
                                </div>
                            ))
                        ) : (
                           // ... placeholders ...
                            <>
                             <div className="w-24 h-36 bg-[#1a1a1a] rounded-xl border border-white/10 shadow-2xl flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform origin-bottom-right group cursor-pointer relative overflow-hidden">
                                 <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                                 <span className="text-slate-600 font-bold text-2xl">?</span>
                            </div>
                            <div className="w-24 h-36 bg-[#1a1a1a] rounded-xl border border-white/10 shadow-2xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform origin-bottom-left group cursor-pointer relative overflow-hidden -ml-2">
                                 <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                                 <span className="text-slate-600 font-bold text-2xl">?</span>
                            </div>
                            </>
                        )}
                        
                        {/* Round Display */}
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-1 rounded-full border border-amber-500/20 backdrop-blur-sm pointer-events-auto">
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                                {gameState.stage || "Loading..."}
                            </span>
                        </div>
                    </div>

                    {/* Right: Actions */}
                   {/* ... (lines 215-283) - Keep existing logic, just ensure no dups */}
                    <div className="flex flex-col gap-4 items-end">
                        {isMyTurn && (
                            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/10 w-64 shadow-2xl mb-2">
                                <div className="flex justify-between text-slate-400 text-xs mb-2">
                                    <span>Bet Amount</span>
                                    <span className="text-white font-mono">${betAmount}</span>
                                </div>
                                {(() => {
                                    const minRaise = gameState.minBet > 0 ? gameState.minBet : (gameState.bigBlind || 20);
                                    return (
                                        <input 
                                            type="range" 
                                            min={minRaise} 
                                            max={(myPlayer?.balance || 0) + (myPlayer?.currentBet || 0)} 
                                            step={10}
                                            value={betAmount < minRaise ? minRaise : betAmount}
                                            onChange={(e) => setBetAmount(Number(e.target.value))}
                                            className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mb-4"
                                        />
                                    )
                                })()}
                                <div className="flex justify-between gap-2">
                                    <button 
                                        onClick={() => setBetAmount(gameState.minBet || 0)}
                                        className="px-2 py-1 bg-white/5 rounded text-xs text-slate-400 hover:text-white"
                                    >
                                        Min
                                    </button>
                                    <button 
                                        onClick={() => setBetAmount(Math.floor(((myPlayer?.balance || 0) + (myPlayer?.currentBet || 0)) / 2))}
                                        className="px-2 py-1 bg-white/5 rounded text-xs text-slate-400 hover:text-white"
                                    >
                                        1/2 Pot
                                    </button>
                                    <button 
                                        onClick={() => setBetAmount((myPlayer?.balance || 0) + (myPlayer?.currentBet || 0))}
                                        className="px-2 py-1 bg-white/5 rounded text-xs text-slate-400 hover:text-white"
                                    >
                                        Max
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 items-center">
                            {isMyTurn ? (
                                <>
                                    <ActionButton secondary onClick={() => sendAction("FOLD")}>Fold</ActionButton>
                                    
                                    {/* Call/Check */}
                                    {(() => {
                                        const amountToCall = (gameState.minBet || 0) - (myPlayer?.currentBet || 0);
                                        return amountToCall > 0 
                                            ? <ActionButton onClick={() => sendAction("CALL")}>Call ${amountToCall}</ActionButton>
                                            : <ActionButton onClick={() => sendAction("CALL")}>Check</ActionButton>
                                    })()}

                                    {/* Raise */}
                                    <ActionButton primary onClick={() => sendAction("RAISE", betAmount)}>
                                        {betAmount > (gameState.minBet || 0) ? `Raise to $${betAmount}` : `Raise to $${gameState.minBet}`}
                                    </ActionButton>
                                </>
                            ) : (
                                <div className="px-6 py-4 rounded-xl border border-white/5 bg-white/5 flex items-center gap-3 text-slate-400">
                                    <span className="relative flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-20"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500/50"></span>
                                    </span>
                                    <span className="font-medium tracking-wide text-sm">Waiting for action...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Subcomponents

// ... Card component ...

function UserTimer({ turnStartTime }: any) {
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (!turnStartTime) return;
        const interval = setInterval(() => {
            const elapsed = (Date.now() - turnStartTime) / 1000;
            const remaining = Math.max(0, 30 - elapsed);
            setTimeLeft(remaining);
        }, 100);
        return () => clearInterval(interval);
    }, [turnStartTime]);

    const progress = (timeLeft / 30) * 100;
    // -inset-4 creates 96px container (64px avatar + 32px padding). R=45 for visible ring. Circumference = 2*PI*45 = ~283
    const dashOffset = 283 - (283 * progress) / 100;

    return (
        <svg className="w-full h-full rotate-[-90deg]">
             <circle
                cx="50%" cy="50%" r="45" // Radius 45 to sit outside the 64px avatar with -inset-4 spacing
                stroke={timeLeft < 5 ? "#ef4444" : "#f59e0b"} 
                strokeWidth="4" fill="transparent"
                strokeDasharray="283"
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-all duration-100 ease-linear"
             />
        </svg>
    )
}

// Subcomponents

function Card({ rank, suit, index }: any) {
    const isRed = suit === '♥' || suit === '♦';
    return (
        <div 
            className="w-16 h-24 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center select-none relative animate-in fade-in zoom-in duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="absolute top-1 left-2 text-xs font-bold text-slate-900">{rank}</div>
            <div className={`text-4xl ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>{suit}</div>
            <div className="absolute bottom-1 right-2 text-xs font-bold text-slate-900 transform rotate-180">{rank}</div>
        </div>
    )
}

function PlayerAvatar({ player, isTurn, turnStartTime }: any) {
    // Basic Timer Logic
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (!isTurn || !turnStartTime) {
            setTimeLeft(30);
            return;
        }

        const interval = setInterval(() => {
            const elapsed = (Date.now() - turnStartTime) / 1000;
            const remaining = Math.max(0, 30 - elapsed);
            setTimeLeft(remaining);
        }, 100);

        return () => clearInterval(interval);
    }, [isTurn, turnStartTime]);

    const progress = (timeLeft / 30) * 100;
    // Circumference = 2 * PI * 40 = ~251
    const dashOffset = 251 - (251 * progress) / 100;

    return (
        <div className={`relative flex flex-col items-center group transition-all duration-300 ${isTurn ? 'scale-110 z-30' : 'opacity-70 hover:opacity-100 hover:scale-105 z-10'}`}>
            
            {/* Glow effect for active turn */}
            {isTurn && <div className="absolute -inset-4 bg-amber-500/20 blur-xl rounded-full animate-pulse"></div>}

            {/* Timer SVG */}
            {isTurn && (
                <div className="absolute -inset-2">
                    <svg className="w-24 h-24 rotate-[-90deg] drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                         <circle
                            cx="48" cy="48" r="40"
                            stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="transparent"
                         />
                         <circle
                            cx="48" cy="48" r="40"
                            stroke={timeLeft < 5 ? "#ef4444" : "#f59e0b"} 
                            strokeWidth="4" fill="transparent"
                            strokeDasharray="251"
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            className="transition-all duration-100 ease-linear"
                         />
                    </svg>
                </div>
            )}

            <div className={`w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative shadow-2xl transition-all duration-300 ${
                isTurn ? 'ring-4 ring-amber-500 ring-offset-2 ring-offset-black' : 'ring-2 ring-white/10'
            }`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                <span className={`font-bold text-2xl ${isTurn ? 'text-amber-500' : 'text-slate-500'}`}>
                    {player.name.substring(0,2).toUpperCase()}
                </span>
            </div>
            
            <div className="absolute -bottom-6 flex flex-col items-center min-w-[100px]">
                <div className={`px-3 py-1 rounded-full border backdrop-blur-md text-xs font-bold shadow-lg mb-1 transition-colors ${
                    isTurn ? 'bg-amber-500 text-black border-amber-400' : 'bg-black/80 text-slate-300 border-white/10'
                }`}>
                    {player.name}
                </div>
                
                <div className="flex flex-col items-center">
                    <span className="text-amber-500 font-mono text-xs shadow-black drop-shadow-md">${player.balance}</span>
                    {player.currentBet > 0 && (
                        <div className="mt-1 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-green-400 border border-green-500/30">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                           ${player.currentBet}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function ActionButton({ children, onClick, primary, secondary }: any) {
    let baseClass = "px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all transform active:scale-95 shadow-lg flex items-center justify-center min-w-[120px]";
    
    if (primary) {
        baseClass += " bg-gradient-to-b from-amber-400 to-amber-600 text-black hover:from-amber-300 hover:to-amber-500 shadow-amber-900/40 border border-amber-400/50";
    } else if (secondary) {
        baseClass += " bg-[#222] text-slate-400 hover:bg-[#333] hover:text-white border border-white/10 shadow-black/20";
    } else {
        baseClass += " bg-[#333] text-white hover:bg-[#444] border border-white/10 hover:border-white/20 shadow-black/20";
    }

    return (
        <button onClick={onClick} className={baseClass}>
            {children}
        </button>
    )
}
