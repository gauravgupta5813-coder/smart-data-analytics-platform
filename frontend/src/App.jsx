import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "./services/api";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Overview from "./pages/Overview";
import Upload from "./pages/Upload";
import Profile from "./pages/Profile";
import Issues from "./pages/Issues";
import Recommendations from "./pages/Recommendations";
import Visualizations from "./pages/Visualizations";
import ML from "./pages/ML";
import Prediction from "./pages/Prediction";
import Settings from "./pages/Settings";
import { CheckCircle2, AlertCircle, Sparkles, X } from "lucide-react";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Global app states
  const [datasetStatus, setDatasetStatus] = useState("none"); // none, uploaded, cleaned, trained
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [mlMetrics, setMlMetrics] = useState(null);
  const [toast, setToast] = useState(null);

  // Dark mode – persisted in localStorage; defaults to light
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    // Only go dark automatically if the OS is in dark mode AND user hasn't set a preference
    return false; // Default: light mode
  });

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  // Apply / remove .dark on <html> whenever isDark changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Trigger custom toast notification
  const showToast = (text, type = "success") => {
    setToast({ text, type });
  };

  // Close toast automatically
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Check backend state on initial load
  useEffect(() => {
    const checkBackendState = async () => {
      try {
        const profileRes = await api.get("/profile");
        if (profileRes.data && !profileRes.data.error) {
          setDatasetInfo(profileRes.data);
          
          let statusVal = "uploaded";
          // Check if clean summary exists to determine if cleaned
          try {
            const cleanRes = await api.get("/clean/summary");
            if (cleanRes.data && !cleanRes.data.error) {
              statusVal = "cleaned";
            }
          } catch {
            // keep uploaded
          }

          // Check if model exists
          try {
            const modelRes = await api.get("/model/status");
            if (modelRes.data && modelRes.data.trained) {
              setMlMetrics(modelRes.data);
              statusVal = "trained";
            }
          } catch {
            // keep statusVal
          }

          setDatasetStatus(statusVal);
        }
      } catch (err) {
        console.log("No dataset loaded on backend yet.");
        setDatasetStatus("none");
      }
    };
    checkBackendState();
  }, []);

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* Navigation Sidebar */}
      <Sidebar datasetStatus={datasetStatus} />

      {/* Main Content Area Wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
        
        {/* Dashboard Header */}
        <Header
          datasetStatus={datasetStatus}
          datasetInfo={datasetInfo}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* Dynamic Route Pages */}
        <main className="flex-grow p-8 max-w-[1600px] w-full mx-auto animate-fade-in-up">
          <Routes>
            <Route
              path="/"
              element={
                <Overview
                  datasetStatus={datasetStatus}
                  datasetInfo={datasetInfo}
                  setDatasetStatus={setDatasetStatus}
                  setDatasetInfo={setDatasetInfo}
                  showToast={showToast}
                />
              }
            />
            <Route
              path="/upload"
              element={
                <Upload
                  setDatasetStatus={setDatasetStatus}
                  setDatasetInfo={setDatasetInfo}
                  showToast={showToast}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <Profile
                  datasetStatus={datasetStatus}
                  datasetInfo={datasetInfo}
                  setDatasetInfo={setDatasetInfo}
                />
              }
            />
            <Route
              path="/issues"
              element={
                <Issues
                  datasetStatus={datasetStatus}
                  datasetInfo={datasetInfo}
                />
              }
            />
            <Route
              path="/recommendations"
              element={
                <Recommendations
                  datasetStatus={datasetStatus}
                  setDatasetStatus={setDatasetStatus}
                  setDatasetInfo={setDatasetInfo}
                  showToast={showToast}
                />
              }
            />
            <Route
              path="/visualizations"
              element={
                <Visualizations
                  datasetStatus={datasetStatus}
                  datasetInfo={datasetInfo}
                />
              }
            />
            <Route
              path="/ml"
              element={
                <ML
                  datasetStatus={datasetStatus}
                  setDatasetStatus={setDatasetStatus}
                  datasetInfo={datasetInfo}
                  mlMetrics={mlMetrics}
                  setMlMetrics={setMlMetrics}
                  showToast={showToast}
                />
              }
            />
            <Route
              path="/prediction"
              element={
                <Prediction
                  datasetStatus={datasetStatus}
                  datasetInfo={datasetInfo}
                  mlMetrics={mlMetrics}
                  showToast={showToast}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <Settings
                  showToast={showToast}
                />
              }
            />
          </Routes>
        </main>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl glass-card border border-slate-200/80 bg-white/95 max-w-sm animate-fade-in-up dark:bg-slate-900/95 dark:border-slate-800">
          <div>
            {toast.type === "success" && (
              <CheckCircle2 className="text-emerald-500" size={20} />
            )}
            {toast.type === "error" && (
              <AlertCircle className="text-rose-500" size={20} />
            )}
            {toast.type === "sparkle" && (
              <Sparkles className="text-cyan-500" size={20} />
            )}
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex-1">
            {toast.text}
          </p>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

    </div>
  );
}

export default App;