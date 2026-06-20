import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UploadCloud,
  Database,
  ShieldAlert,
  Sparkles,
  LineChart,
  BrainCircuit,
  Cpu,
  Settings,
  Terminal
} from "lucide-react";

function Sidebar() {
  const menuItems = [
    { path: "/", label: "Dashboard Overview", icon: LayoutDashboard },
    { path: "/upload", label: "Upload Dataset", icon: UploadCloud },
    { path: "/profile", label: "Dataset Profile", icon: Database },
    { path: "/issues", label: "Data Quality Issues", icon: ShieldAlert },
    { path: "/recommendations", label: "Recommendations", icon: Sparkles },
    { path: "/visualizations", label: "Visualizations", icon: LineChart },
    { path: "/ml", label: "Machine Learning", icon: BrainCircuit },
    { path: "/prediction", label: "Predictions", icon: Cpu },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-72 glass-sidebar text-slate-300 flex flex-col min-h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-6 pb-8 border-b border-slate-800/40 flex items-center gap-3">
        <div className="bg-gradient-to-tr from-indigo-500 to-cyan-400 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/10">
          <BrainCircuit size={24} className="animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text">
            AETHER ENGINE
          </h1>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            Enterprise v1.2
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-primary to-cyan-500/20 text-white shadow-md shadow-primary/10 border-l-4 border-cyan-400"
                    : "hover:bg-slate-800/50 hover:text-white text-slate-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <IconComponent
                    size={18}
                    className={`transition-colors group-hover:scale-105 ${
                      isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Status / Console shortcut */}
      <div className="px-6 py-4 border-t border-slate-800/40 bg-slate-950/20">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>API Online</span>
          </div>
          <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
            SSL Secure
          </span>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-5 border-t border-slate-800/40 flex items-center gap-3">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80"
          alt="Avatar"
          className="w-10 h-10 rounded-xl object-cover border border-slate-700/50"
        />
        <div className="flex-1 overflow-hidden">
          <h4 className="text-sm font-semibold text-white truncate">Gaurav Sharma</h4>
          <p className="text-xs text-slate-500 truncate">gaurav.sharma@aether.ai</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;