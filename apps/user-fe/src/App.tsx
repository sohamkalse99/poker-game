import { useState, useEffect } from "react";
import { Lobby } from "./components/Lobby";
import { GameTable } from "./components/GameTable";
import { Gem, ArrowRight } from "lucide-react";

function App() {
  const [view, setView] = useState<'LOGIN' | 'LOBBY' | 'GAME'>('LOGIN');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [username, setUsername] = useState<string>(localStorage.getItem("username") || "Player");

  useEffect(() => {
    if (token) {
        setView('LOBBY');
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setView('LOGIN');
  }

  const handleLogin = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/v1/user/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email, password })
        });
        const data = await res.json();
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", email);
            setToken(data.token);
            setUsername(email);
            setView('LOBBY');
        } else {
            alert(data.message || "Login failed");
        }
      } catch (e) { 
        console.error(e);
        alert("Error logging in"); 
      }
  };

  const handleSignup = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (email.length < 3 || password.length < 6) {
          alert("Username must be 3+ chars, Password 6+ chars");
          return;
      }
      try {
        const res = await fetch("http://localhost:3001/api/v1/user/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email, password })
        });
        const data = await res.json();
        if (res.ok) {
            alert("Signed up! Please login.");
        } else {
            alert(data.message || "Signup failed");
        }
      } catch (e) { 
        console.error(e);
        alert("Error signing up (Check console)"); 
      }
  };

  const joinTable = (tableId: string) => {
      setSelectedTable(tableId);
      setView('GAME');
  };

  if (view === 'GAME' && token) {
      return <GameTable tableId={selectedTable} userId={username} token={token} onLeave={() => setView('LOBBY')} />;
  }

  if (view === 'LOBBY' && token) {
      return (
          <Lobby 
            token={token} 
            username={username} 
            onJoin={joinTable} 
            onLogout={logout} 
          />
      );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-[#050505] text-slate-200">
      <div className="bg-[#111] p-8 rounded-2xl border border-white/5 w-96 shadow-2xl relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex flex-col items-center mb-8 relative">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
                <Gem size={24} className="text-black" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Welcome Back</h1>
            <p className="text-slate-500 text-sm mt-1">Enter your details to access the table.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4 relative">
            <div>
                <input 
                    className="w-full bg-black/50 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition text-white placeholder:text-slate-600" 
                    placeholder="Email / Username" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
            </div>
            <div>
                <input 
                    className="w-full bg-black/50 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition text-white placeholder:text-slate-600" 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>
            
            <button 
                type="submit"
                className="w-full bg-slate-200 hover:bg-white text-black py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 mt-2"
            >
                Start Playing <ArrowRight size={16} />
            </button>

            <div className="text-center mt-4">
                <button 
                    type="button"
                    onClick={(e) => handleSignup(e)}
                    className="text-xs text-slate-500 hover:text-amber-500 transition"
                >
                    Create an account
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}

export default App;
