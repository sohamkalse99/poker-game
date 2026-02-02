import { useState, useEffect } from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";

export function RoomManager() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newRoom, setNewRoom] = useState({ name: "", smallBlind: 10, maxPlayers: 9, minBuyIn: 400 });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/v1/user/rooms");
            const data = await res.json();
            setRooms(data.rooms || []);
        } catch (e) {
            console.error(e);
        }
    };

    const createRoom = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/v1/admin/room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRoom)
            });
            if (res.ok) {
                setShowCreate(false);
                fetchRooms();
            } else {
                alert("Failed to create room");
            }
        } catch (e) {
            alert("Error creating room");
        }
    };

    const deleteRoom = async (roomId: string) => {
        if (!confirm("Are you sure you want to delete this room?")) return;
        try {
            const res = await fetch(`http://localhost:3001/api/v1/admin/room/${roomId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                fetchRooms();
            } else {
                alert("Failed to delete room");
            }
        } catch (e) {
            alert("Error deleting room");
        }
    };

    return (
        <div className="p-8 bg-slate-950 min-h-screen text-slate-100 w-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Rooms</h1>
                    <p className="text-slate-400 mt-1">Manage poker tables and sessions</p>
                </div>
                <button 
                    onClick={() => setShowCreate(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition"
                >
                    <Plus size={18} /> Create Room
                </button>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Blinds</th>
                            <th className="p-4 font-medium">Buy-in</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {rooms.map(room => (
                            <tr key={room.id} className="hover:bg-slate-800/50 transition">
                                <td className="p-4 font-medium text-white">{room.name}</td>
                                <td className="p-4 text-slate-300">${room.smallBlind} / ${room.bigBlind}</td>
                                <td className="p-4 text-slate-300">Min: {room.minBuyIn}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        room.status === 'playing' ? 'bg-green-500/10 text-green-400' : 
                                        room.status === 'waiting' ? 'bg-yellow-500/10 text-yellow-400' : 
                                        'bg-slate-500/10 text-slate-400'
                                    }`}>
                                        {room.status || 'Active'}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button className="text-slate-400 hover:text-blue-400"><ExternalLink size={18} /></button>
                                    <button className="text-slate-400 hover:text-red-400" onClick={() => deleteRoom(room.id)}><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {rooms.length === 0 && (
                    <div className="p-8 text-center text-slate-500">No rooms found. Create one to get started.</div>
                )}
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create New Room</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Room Name</label>
                                <input 
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                    value={newRoom.name}
                                    onChange={e => setNewRoom({...newRoom, name: e.target.value})}
                                    placeholder="e.g. High Stakes Lounge"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Small Blind</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                        value={newRoom.smallBlind}
                                        onChange={e => setNewRoom({...newRoom, smallBlind: Number(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Max Players</label>
                                    <select 
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                        value={newRoom.maxPlayers}
                                        onChange={e => setNewRoom({...newRoom, maxPlayers: Number(e.target.value)})}
                                    >
                                        <option value="6">6 Players</option>
                                        <option value="9">9 Players</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button 
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2 text-slate-300 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={createRoom}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
                            >
                                Create Room
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
