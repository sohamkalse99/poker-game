import { useState, useEffect } from "react";
import { Users, RefreshCw, LogOut, ChevronRight, Gem } from "lucide-react";

interface LobbyProps {
    token: string;
    username: string;
    onJoin: (tableId: string) => void;
    onLogout: () => void;
}

export function Lobby({ token, username, onJoin, onLogout }: LobbyProps) {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = () => {
        setLoading(true);
        fetch("http://localhost:3001/api/v1/user/rooms", {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setRooms(data.rooms || []);
            setLoading(false);
        })
        .catch(e => {
            console.error(e);
            setLoading(false);
        });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-amber-500/30">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#0a0a0a] sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500 rounded-lg text-black">
                            <Gem size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent tracking-wide">
                            POKER
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-4 bg-white/5 py-2 px-4 rounded-full border border-white/5">
                            <span className="text-amber-400 font-bold text-lg flex items-center gap-2">
                                49,600 <span className="text-xs text-slate-400 font-normal uppercase tracking-wider">chips</span>
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center font-bold text-amber-500 shadow-inner">
                                    {username.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="font-medium text-slate-300">{username}</span>
                            </div>
                            <button 
                                onClick={onLogout}
                                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-light text-amber-100 mb-2 font-serif">Poker Lobby</h1>
                        <p className="text-slate-500">Choose a table to begin your game</p>
                    </div>
                    <button 
                        onClick={fetchRooms}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-sm font-medium text-amber-500/80 hover:text-amber-400"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map(room => (
                        <RoomCard key={room.id} room={room} onJoin={() => onJoin(room.id)} />
                    ))}
                    {rooms.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center text-slate-600 border-2 border-dashed border-white/5 rounded-2xl">
                            No active tables found.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function RoomCard({ room, onJoin }: { room: any, onJoin: () => void }) {
    return (
        <div className="group bg-[#121212] border border-white/5 rounded-2xl p-6 hover:border-amber-500/30 transition-all hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-20 h-20 bg-amber-500/10 blur-2xl rounded-full translate-x-10 -translate-y-10"></div>
            </div>

            <div className="flex justify-between items-start mb-6 relative">
                <div>
                    <h3 className="text-xl text-slate-200 font-medium font-serif tracking-wide">{room.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">
                            Open
                        </span>
                        <span className="text-xs text-slate-500">Texas Hold'em</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-8 relative">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-500 text-sm">Blinds</span>
                    <span className="text-amber-100 font-mono">${room.smallBlind} / ${room.bigBlind}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-500 text-sm">Buy-in</span>
                    <span className="text-slate-300 font-mono">${room.minBuyIn} - ${room.maxBuyIn}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500 text-sm">Players</span>
                    <div className="flex items-center gap-2 text-slate-300">
                        <Users size={14} />
                        <span>0 / {room.maxPlayers}</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={onJoin}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-bold rounded-xl transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 group-hover:gap-3"
            >
                Join Table <ChevronRight size={16} className="opacity-60" />
            </button>
        </div>
    )
}
