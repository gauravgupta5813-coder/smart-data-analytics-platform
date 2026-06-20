import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, Search, Sun, Moon, Database, ShieldAlert, Sparkles, BrainCircuit,
  LayoutDashboard, UploadCloud, LineChart, Cpu, Settings, X, ArrowRight,
  Command
} from "lucide-react";

// ── Searchable routes ─────────────────────────────────────────────────────
const SEARCH_ITEMS = [
  { label: "Dashboard Overview",       path: "/",               icon: LayoutDashboard, category: "Pages"   },
  { label: "Upload Dataset",           path: "/upload",          icon: UploadCloud,     category: "Pages"   },
  { label: "Dataset Profile",          path: "/profile",         icon: Database,        category: "Pages"   },
  { label: "Data Quality Issues",      path: "/issues",          icon: ShieldAlert,     category: "Pages"   },
  { label: "Cleaning Recommendations", path: "/recommendations", icon: Sparkles,        category: "Pages"   },
  { label: "Visualizations",           path: "/visualizations",  icon: LineChart,       category: "Pages"   },
  { label: "Machine Learning",         path: "/ml",              icon: BrainCircuit,    category: "Pages"   },
  { label: "Predictions",              path: "/prediction",      icon: Cpu,             category: "Pages"   },
  { label: "Settings",                 path: "/settings",        icon: Settings,        category: "Pages"   },
  { label: "Toggle Dark / Light Theme",path: null,               icon: Moon,            category: "Actions", action: "toggle-theme" },
  { label: "Clear notifications",      path: null,               icon: Bell,            category: "Actions", action: "clear-notifications" },
];

function Header({ datasetStatus, datasetInfo, isDark, onToggleTheme }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "System initialized and ready.", type: "info", time: "Just now" }
  ]);

  // ── Search / Command Palette ─────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [showPalette, setShowPalette] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const searchRef = useRef(null);
  const paletteRef = useRef(null);

  const filtered = query.trim().length === 0
    ? SEARCH_ITEMS
    : SEARCH_ITEMS.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => { setSelectedIdx(0); }, [query]);

  // Ctrl+K → open palette
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowPalette(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === "Escape") { setShowPalette(false); setQuery(""); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Click-outside → close palette
  useEffect(() => {
    const handler = (e) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target)) {
        setShowPalette(false); setQuery("");
      }
    };
    if (showPalette) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPalette]);

  const executeItem = useCallback((item) => {
    setShowPalette(false); setQuery("");
    if (item.action === "toggle-theme") onToggleTheme();
    else if (item.action === "clear-notifications") setNotifications([]);
    else if (item.path) navigate(item.path);
  }, [navigate, onToggleTheme]);

  const handleKeyDown = (e) => {
    if (!showPalette) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && filtered[selectedIdx]) executeItem(filtered[selectedIdx]);
  };

  // ── Notifications ────────────────────────────────────────────────────────
  useEffect(() => {
    if (datasetStatus === "uploaded") {
      setNotifications(prev => [{ id: Date.now(), text: `Dataset uploaded: ${datasetInfo?.rows || 0} rows found.`, type: "success", time: "Just now" }, ...prev]);
    } else if (datasetStatus === "cleaned") {
      setNotifications(prev => [{ id: Date.now(), text: "AI Data Cleaning applied successfully.", type: "sparkle", time: "Just now" }, ...prev]);
    } else if (datasetStatus === "trained") {
      setNotifications(prev => [{ id: Date.now(), text: "Machine Learning model trained successfully.", type: "brain", time: "Just now" }, ...prev]);
    }
  }, [datasetStatus, datasetInfo]);

  // ── Status badge ─────────────────────────────────────────────────────────
  const getStatusBadge = () => {
    switch (datasetStatus) {
      case "uploaded":
        return (
          <span style={isDark ? { background: "rgba(120,80,0,0.25)", color: "#FBBF24", border: "1px solid rgba(120,80,0,0.4)" }
            : { background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A" }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold">
            <ShieldAlert size={14} className="animate-pulse" style={{ color: isDark ? "#FBBF24" : "#F59E0B" }} />
            Raw Data Loaded
          </span>
        );
      case "cleaned":
        return (
          <span style={isDark ? { background: "rgba(5,78,22,0.25)", color: "#34D399", border: "1px solid rgba(5,78,22,0.5)" }
            : { background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold">
            <Sparkles size={14} style={{ color: isDark ? "#34D399" : "#10B981" }} />
            Cleaned &amp; Ready
          </span>
        );
      case "trained":
        return (
          <span style={isDark ? { background: "rgba(49,46,129,0.4)", color: "#A5B4FC", border: "1px solid rgba(79,70,229,0.4)" }
            : { background: "#EEF2FF", color: "#3730A3", border: "1px solid #C7D2FE" }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold">
            <BrainCircuit size={14} style={{ color: isDark ? "#818CF8" : "#4F46E5" }} />
            Model Trained
          </span>
        );
      default:
        return (
          <span style={isDark ? { background: "rgba(30,41,59,0.6)", color: "#94A3B8", border: "1px solid rgba(51,65,85,0.6)" }
            : { background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0" }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold">
            <Database size={14} style={{ color: isDark ? "#64748B" : "#94A3B8" }} />
            No Dataset
          </span>
        );
    }
  };

  // ── Theme-driven inline styles ───────────────────────────────────────────
  const headerStyle = isDark
    ? { background: "rgba(15,23,42,0.92)", borderBottom: "1px solid rgba(51,65,85,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }
    : { background: "rgba(255,255,255,0.82)", borderBottom: "1px solid rgba(226,232,240,0.8)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" };

  const searchBtnStyle = isDark
    ? { background: "rgba(30,41,59,0.7)", border: "1px solid rgba(51,65,85,0.7)", color: "#64748B" }
    : { background: "rgba(241,245,249,0.8)", border: "1px solid rgba(226,232,240,0.9)", color: "#94A3B8" };

  const iconBtnStyle = isDark
    ? { background: "transparent", border: "1px solid rgba(51,65,85,0.7)", color: "#94A3B8" }
    : { background: "transparent", border: "1px solid #E2E8F0", color: "#64748B" };

  const paletteStyle = isDark
    ? { background: "rgba(15,23,42,0.97)", border: "1px solid rgba(51,65,85,0.6)", color: "#E2E8F0" }
    : { background: "rgba(255,255,255,0.98)", border: "1px solid rgba(226,232,240,0.8)", color: "#1E293B" };

  const dividerStyle = isDark ? { background: "#334155" } : { background: "#E2E8F0" };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 transition-all duration-300"
      style={headerStyle}
    >
      {/* ── Search trigger ── */}
      <div className="relative w-80 max-w-full">
        <button
          onClick={() => { setShowPalette(true); setTimeout(() => searchRef.current?.focus(), 50); }}
          className="w-full flex items-center gap-3 pl-4 pr-3 py-2.5 text-sm rounded-xl transition-all duration-200 cursor-pointer hover:border-indigo-400"
          style={searchBtnStyle}
        >
          <Search size={16} className="shrink-0" />
          <span className="flex-1 text-left text-sm" style={{ color: isDark ? "#475569" : "#94A3B8" }}>
            Search pages, actions…
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono"
            style={isDark
              ? { background: "rgba(30,41,59,0.8)", border: "1px solid rgba(51,65,85,0.8)", color: "#475569" }
              : { background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#94A3B8" }}>
            <Command size={9} />K
          </kbd>
        </button>
      </div>

      {/* ── Command Palette Overlay ── */}
      {showPalette && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
          style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}
        >
          <div
            ref={paletteRef}
            className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
            style={paletteStyle}
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: isDark ? "1px solid rgba(51,65,85,0.5)" : "1px solid #F1F5F9" }}>
              <Search size={18} style={{ color: "#64748B" }} className="shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search pages, actions..."
                className="flex-1 bg-transparent text-sm focus:outline-none"
                style={{ color: isDark ? "#E2E8F0" : "#1E293B" }}
                autoFocus
              />
              {query && (
                <button onClick={() => setQuery("")} className="cursor-pointer transition-colors"
                  style={{ color: "#64748B" }}>
                  <X size={16} />
                </button>
              )}
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0"
                style={isDark
                  ? { background: "rgba(30,41,59,0.8)", border: "1px solid rgba(51,65,85,0.8)", color: "#475569" }
                  : { background: "#F1F5F9", border: "1px solid #E2E8F0", color: "#94A3B8" }}>
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <p className="text-center text-sm py-6" style={{ color: "#64748B" }}>No results for "{query}"</p>
              ) : (
                (() => {
                  let lastCat = null;
                  return filtered.map((item, i) => {
                    const Icon = item.icon;
                    const showCat = item.category !== lastCat;
                    lastCat = item.category;
                    const isSelected = selectedIdx === i;
                    return (
                      <div key={item.label}>
                        {showCat && (
                          <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest"
                            style={{ color: isDark ? "#475569" : "#94A3B8" }}>
                            {item.category}
                          </p>
                        )}
                        <button
                          onMouseEnter={() => setSelectedIdx(i)}
                          onClick={() => executeItem(item)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors cursor-pointer"
                          style={{
                            background: isSelected
                              ? (isDark ? "rgba(79,70,229,0.15)" : "#EEF2FF")
                              : "transparent",
                            color: isSelected
                              ? (isDark ? "#A5B4FC" : "#4338CA")
                              : (isDark ? "#CBD5E1" : "#475569"),
                          }}
                        >
                          <Icon size={16} style={{ color: isSelected ? "#6366F1" : "#94A3B8" }} />
                          <span className="flex-1">{item.label}</span>
                          {isSelected && <ArrowRight size={14} style={{ color: "#6366F1" }} />}
                        </button>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 flex items-center gap-4 text-[10px]"
              style={{ borderTop: isDark ? "1px solid rgba(51,65,85,0.5)" : "1px solid #F1F5F9", color: "#64748B" }}>
              <span><kbd className="font-mono px-1 rounded"
                style={isDark ? { background: "rgba(30,41,59,0.8)" } : { background: "#F1F5F9" }}>↑↓</kbd> navigate</span>
              <span><kbd className="font-mono px-1 rounded"
                style={isDark ? { background: "rgba(30,41,59,0.8)" } : { background: "#F1F5F9" }}>↵</kbd> open</span>
              <span><kbd className="font-mono px-1 rounded"
                style={isDark ? { background: "rgba(30,41,59,0.8)" } : { background: "#F1F5F9" }}>ESC</kbd> close</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Right actions ── */}
      <div className="flex items-center gap-4">
        {/* Dataset Status */}
        <div className="hidden sm:block">{getStatusBadge()}</div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer"
          style={iconBtnStyle}
          onMouseEnter={e => {
            e.currentTarget.style.background = isDark ? "rgba(30,41,59,0.8)" : "#F1F5F9";
          }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          {isDark
            ? <Sun size={18} style={{ color: "#FBBF24" }} />
            : <Moon size={18} style={{ color: "#6366F1" }} />
          }
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(v => !v)}
            className="relative p-2.5 rounded-xl transition-all duration-200 cursor-pointer"
            style={iconBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(30,41,59,0.8)" : "#F1F5F9"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"
                style={{ border: `2px solid ${isDark ? "#0F172A" : "#FFFFFF"}` }} />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl p-4 animate-fade-in-up z-40"
              style={{ ...paletteStyle, boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 60px rgba(0,0,0,0.1)" }}>
              <div className="flex justify-between items-center mb-3 pb-2"
                style={{ borderBottom: isDark ? "1px solid rgba(51,65,85,0.5)" : "1px solid #F1F5F9" }}>
                <h4 className="font-semibold text-sm">Notifications</h4>
                <button
                  onClick={() => setNotifications([])}
                  className="text-xs cursor-pointer hover:underline"
                  style={{ color: "#6366F1" }}
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: "#64748B" }}>No new notifications</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="flex gap-3 p-2 rounded-xl transition-colors"
                      style={{ ':hover': { background: isDark ? "rgba(30,41,59,0.5)" : "#F8FAFC" } }}>
                      <div className="mt-1.5 shrink-0">
                        {n.type === "success" && <span className="w-2 h-2 rounded-full bg-emerald-500 block" />}
                        {n.type === "sparkle" && <span className="w-2 h-2 rounded-full bg-cyan-500 block" />}
                        {n.type === "brain"   && <span className="w-2 h-2 rounded-full bg-indigo-500 block" />}
                        {n.type === "info"    && <span className="w-2 h-2 rounded-full bg-blue-400 block" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-snug" style={{ color: isDark ? "#CBD5E1" : "#374151" }}>{n.text}</p>
                        <span className="text-[10px]" style={{ color: "#94A3B8" }}>{n.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px" style={dividerStyle} />

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold" style={{ color: isDark ? "#F1F5F9" : "#1E293B" }}>Gaurav Sharma</p>
            <p className="text-xs" style={{ color: "#94A3B8" }}>ML &amp; Data Engineer</p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80"
            alt="User Avatar"
            className="w-10 h-10 rounded-xl object-cover shadow"
            style={{ boxShadow: `0 0 0 2px ${isDark ? "rgba(79,70,229,0.3)" : "rgba(79,70,229,0.15)"}` }}
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
