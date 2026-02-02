import { LayoutDashboard, Users, Table, LogOut } from 'lucide-react';

export function Sidebar({ activePage, setPage, onLogout }: any) {
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'rooms', icon: Table, label: 'Rooms' },
        { id: 'users', icon: Users, label: 'Users' },
    ];

    return (
        <div className="w-64 bg-slate-900 h-screen text-white flex flex-col">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-blue-500">🛡️</span> Poker Admin
                </h1>
            </div>
            
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map(item => (
                        <li key={item.id}>
                            <button
                                onClick={() => setPage(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    activePage === item.id 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
