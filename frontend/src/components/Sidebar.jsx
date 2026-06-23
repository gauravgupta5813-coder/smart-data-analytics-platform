import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
  UserCircle2,
  BarChart3,
} from "lucide-react";
import { useProfile } from "../hooks/useProfile";

// Initials avatar fallback
function Avatar({ name, avatar, size = 40 }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-xl object-cover border border-slate-700/50 shrink-0"
      />
    );
  }

  // Gradient initials avatar
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-cyan-400 text-white font-bold text-sm select-none"
    >
      {initials}
    </div>
  );
}

function Sidebar() {
  const navigate = useNavigate();
  const { profile: storedProfile } = useProfile();
  const [profile, setProfile] = useState(storedProfile);

  // Listen for same-tab profile updates
  useEffect(() => {
    const handler = (e) => setProfile({ ...storedProfile, ...e.detail });
    window.addEventListener("aether-profile-update", handler);
    return () => window.removeEventListener("aether-profile-update", handler);
  }, [storedProfile]);

  // Keep in sync when hook updates (cross-tab)
  useEffect(() => {
    setProfile(storedProfile);
  }, [storedProfile]);

  const menuItems = [
    { path: "/",               label: "Dashboard Overview",  icon: LayoutDashboard },
    { path: "/upload",         label: "Upload Dataset",      icon: UploadCloud     },
    { path: "/profile",        label: "Dataset Profile",     icon: Database        },
    { path: "/issues",         label: "Data Quality Issues", icon: ShieldAlert     },
    { path: "/recommendations",label: "Recommendations",     icon: Sparkles        },
    { path: "/visualizations", label: "Visualizations",      icon: LineChart       },
    { path: "/ml",             label: "Machine Learning",    icon: BrainCircuit    },
    { path: "/prediction",     label: "Predictions",         icon: Cpu             },
    { path: "/settings",       label: "Settings",            icon: Settings        },
  ];

  return (
    <aside className="w-72 glass-sidebar text-slate-300 flex flex-col min-h-screen sticky top-0 shrink-0">

      {/* ── Brand Header ─────────────────────────────────────────── */}
      <button
        onClick={() => navigate("/")}
        className="relative px-6 pt-7 pb-6 border-b border-white/5 flex flex-col items-start gap-3 w-full text-left group hover:bg-white/[0.03] transition-colors duration-300 cursor-pointer overflow-hidden"
      >
        {/* Radial background glow behind logo */}
        <div
          className="absolute -top-6 -left-6 w-36 h-36 rounded-full pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity duration-500"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
        />

        {/* Logo icon — layered squares with glow */}
        <div className="relative flex items-center gap-3.5">
          <div className="relative shrink-0">
            {/* Outer soft ring */}
            <div className="absolute inset-0 rounded-2xl logo-glow opacity-80" />
            {/* Main icon box */}
            <div
              className="relative z-10 w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)",
              }}
            >
              {/* Inner accent layer */}
              <div
                className="absolute inset-1 rounded-xl opacity-30"
                style={{ background: "linear-gradient(135deg, #fff 0%, transparent 60%)" }}
              />
              <BarChart3 size={20} strokeWidth={2.5} className="relative z-10 text-white drop-shadow" />
            </div>
            {/* Live indicator dot */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse z-20" />
          </div>

          {/* App name with shimmer */}
          <div className="flex flex-col leading-none gap-0.5">
            <h1
              className="brand-shimmer text-[22px] font-bold tracking-tight leading-none"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              DataLens
            </h1>
            <span
              className="text-[10px] font-semibold tracking-[0.18em] uppercase"
              style={{ color: "#4f6bff", letterSpacing: "0.2em", fontFamily: "var(--font-brand)" }}
            >
              Analytics
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p
          className="text-[11px] leading-relaxed pl-0.5 group-hover:text-slate-300 transition-colors duration-300"
          style={{
            color: "#64748b",
            fontStyle: "italic",
            fontFamily: "var(--font-brand)",
            fontWeight: 400,
          }}
        >
          ✦ Turn raw data into&nbsp;
          <span style={{ color: "#818cf8" }}>intelligent insights</span>
        </p>
      </button>

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
                  <span style={{ fontFamily: "var(--font-brand)", fontWeight: 500 }}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>


      {/* System Status */}
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

      {/* User Footer Profile — editable via Settings */}
      <button
        onClick={() => navigate("/settings")}
        className="p-5 border-t border-slate-800/40 flex items-center gap-3 w-full text-left group hover:bg-slate-800/30 transition-colors duration-200 cursor-pointer"
        title="Edit profile in Settings"
      >
        <Avatar name={profile.name} avatar={profile.avatar} size={40} />
        <div className="flex-1 overflow-hidden">
          <h4 className="text-sm font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
            {profile.name || <span className="italic text-slate-500">Set up profile →</span>}
          </h4>
          <p className="text-xs text-slate-500 truncate">
            {profile.role || "Click to personalise"}
          </p>
        </div>
        <UserCircle2
          size={16}
          className="text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0"
        />
      </button>
    </aside>
  );
}

export default Sidebar;