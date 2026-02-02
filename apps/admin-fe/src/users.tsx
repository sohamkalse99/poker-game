import { useState, useEffect } from "react";
import { Search, Ban } from "lucide-react";

export function UserManager() {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/v1/admin/users");
            const data = await res.json();
            setUsers(data.users || []);
        } catch (e) {
            console.error(e);
        }
    };

    const filteredUsers = users.filter((u: any) => 
        u.username.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 bg-slate-950 min-h-screen text-slate-100 w-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Users</h1>
                    <p className="text-slate-400 mt-1">Manage platform users</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        className="bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 w-64"
                        placeholder="Search users..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                            <th className="p-4 font-medium">User</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Balance</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Joined</th>
                            <th className="p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-800/50 transition">
                                <td className="p-4 font-medium flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                                        {user.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    {user.username}
                                </td>
                                <td className="p-4 text-slate-400">{user.email}</td>
                                <td className="p-4 text-green-400 font-medium">${user.balance.toLocaleString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        user.isAdmin ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-500/10 text-slate-400'
                                    }`}>
                                        {user.isAdmin ? 'Admin' : 'User'}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-500 text-sm">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button className="text-slate-400 hover:text-red-400" title="Ban User">
                                        <Ban size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="p-8 text-center text-slate-500">No users found.</div>
                )}
            </div>
        </div>
    );
}
