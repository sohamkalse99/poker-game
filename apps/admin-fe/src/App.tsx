import { useState } from "react";
import { Sidebar } from "./sidebar";
import { RoomManager } from "./rooms";
import { UserManager } from "./users";
import { Users, BarChart } from "lucide-react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activePage, setActivePage] = useState("dashboard");

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (password === "admin123") setIsAuthenticated(true);
    else alert("Invalid Password");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-xl border border-slate-800 flex flex-col gap-4 w-96">
            <h1 className="text-2xl font-bold text-center mb-2">Admin Login</h1>
            <input
                type="password"
                placeholder="Password"
                className="bg-slate-950 border border-slate-800 p-3 rounded text-white outline-none focus:border-blue-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 py-3 rounded font-bold transition">
                Access Dashboard
            </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950">
        <Sidebar activePage={activePage} setPage={setActivePage} onLogout={() => setIsAuthenticated(false)} />
        
        <div className="flex-1 overflow-auto">
            {activePage === 'dashboard' && <DashboardWelcome />}
            {activePage === 'rooms' && <RoomManager />}
            {activePage === 'users' && <UserManager />}
        </div>
    </div>
  );
}

function DashboardWelcome() {
    return (
        <div className="p-8 text-white">
            <h1 className="text-4xl font-bold mb-6">Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Revenue" value="$45,200" icon={<BarChart className="text-green-500" />} />
                <StatCard title="Active Players" value="128" icon={<Users className="text-blue-500" />} />
                <StatCard title="Open Tables" value="12" icon={<div className="text-purple-500">♠️</div>} />
            </div>
        </div>
    )
}

function StatCard({ title, value, icon }: any) {
    return (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-slate-800 rounded-lg">{icon}</div>
            <div>
                <p className="text-slate-400 text-sm">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    )
}

function UsersPlaceholder() {
    return <div className="p-8 text-slate-400">User management coming soon...</div>
}

export default App;
