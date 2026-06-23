import { useState, useRef } from "react";
import { Sliders, Server, ShieldAlert, Check, User, Camera, Mail, Briefcase } from "lucide-react";
import { useProfile } from "../hooks/useProfile";

// Initials avatar preview
function AvatarPreview({ name, avatar }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  if (avatar) {
    return (
      <img
        src={avatar}
        alt="Avatar preview"
        className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-lg"
      />
    );
  }
  return (
    <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-cyan-400 text-white font-bold text-2xl select-none shadow-lg border-2 border-indigo-500/30">
      {initials}
    </div>
  );
}

function Settings({ showToast }) {
  // ── System settings ──────────────────────────────────────────────────────
  const [apiHost, setApiHost] = useState("http://127.0.0.1:8000");
  const [trees, setTrees] = useState(100);
  const [testSplit, setTestSplit] = useState(20);
  const [iqrThreshold, setIqrThreshold] = useState(1.5);
  const [saveLoading, setSaveLoading] = useState(false);

  const saveSettings = () => {
    setSaveLoading(true);
    setTimeout(() => {
      setSaveLoading(false);
      showToast("Settings saved successfully!", "success");
    }, 800);
  };

  // ── User profile ─────────────────────────────────────────────────────────
  const { profile, saveProfile } = useProfile();
  const [localName,   setLocalName]   = useState(profile.name  || "");
  const [localRole,   setLocalRole]   = useState(profile.role  || "");
  const [localEmail,  setLocalEmail]  = useState(profile.email || "");
  const [localAvatar, setLocalAvatar] = useState(profile.avatar || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Convert uploaded image to base64 data-URL
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLocalAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    setProfileLoading(true);
    setTimeout(() => {
      saveProfile({ name: localName, role: localRole, email: localEmail, avatar: localAvatar });
      setProfileLoading(false);
      showToast("Profile updated! Changes applied everywhere.", "sparkle");
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your profile and system configuration preferences.
        </p>
      </div>

      {/* ── User Profile Card ────────────────────────────────────────────── */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
        {/* Section title */}
        <div className="flex items-center gap-2 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/15 to-cyan-400/15">
            <User size={17} className="text-indigo-500 dark:text-indigo-400" />
          </div>
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">User Profile</h3>
          <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            saved locally
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar section */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <AvatarPreview name={localName} avatar={localAvatar} />

            {/* Upload photo button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-dashed border-indigo-400/50 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
            >
              <Camera size={13} />
              Upload photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Or clear avatar */}
            {localAvatar && (
              <button
                onClick={() => setLocalAvatar("")}
                className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                Remove photo
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Name */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <User size={12} /> Display Name
              </label>
              <input
                type="text"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="Your full name"
                className="w-full text-sm font-medium p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-colors"
              />
            </div>

            {/* Role */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Briefcase size={12} /> Role / Title
              </label>
              <input
                type="text"
                value={localRole}
                onChange={(e) => setLocalRole(e.target.value)}
                placeholder="e.g. ML Engineer"
                className="w-full text-sm font-medium p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Mail size={12} /> Email (optional)
              </label>
              <input
                type="email"
                value={localEmail}
                onChange={(e) => setLocalEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-sm font-medium p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-colors"
              />
            </div>

            {/* Avatar URL alternative */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Camera size={12} /> Avatar URL (alternative to upload)
              </label>
              <input
                type="url"
                value={localAvatar.startsWith("data:") ? "" : localAvatar}
                onChange={(e) => setLocalAvatar(e.target.value)}
                placeholder="https://example.com/your-photo.jpg"
                disabled={localAvatar.startsWith("data:")}
                className="w-full text-xs font-mono font-medium p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {localAvatar.startsWith("data:") && (
                <p className="text-[10px] text-slate-400">URL field disabled — uploaded image is active.</p>
              )}
            </div>
          </div>
        </div>

        {/* Save profile button */}
        <div className="flex justify-end mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSaveProfile}
            disabled={profileLoading}
            className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/20 hover:opacity-90 disabled:opacity-60"
          >
            {profileLoading ? "Saving..." : (
              <>
                <Check size={14} />
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── System Configuration ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ML Hyperparameter settings */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-850">
            <Sliders size={18} className="text-slate-400" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">ML Defaults</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Random Forest Estimators</label>
              <input
                type="number"
                value={trees}
                onChange={(e) => setTrees(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700"
              />
              <span className="text-[10px] text-slate-400">Default decision trees in ensemble (usually 10-500)</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Validation Test Split (%)</label>
              <input
                type="number"
                value={testSplit}
                onChange={(e) => setTestSplit(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700"
              />
              <span className="text-[10px] text-slate-400">Ratio of dataset allocated for testing validation models</span>
            </div>
          </div>
        </div>

        {/* Data Quality setting */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-850">
            <ShieldAlert size={18} className="text-slate-400" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">Quality Diagnostics</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Outlier IQR Boundary Coefficient</label>
              <input
                type="number"
                step="0.1"
                value={iqrThreshold}
                onChange={(e) => setIqrThreshold(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700"
              />
              <span className="text-[10px] text-slate-400">Standard Tukey's fences: 1.5 for outliers, 3.0 for extreme outliers</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Cardinality Threshold Ratio</label>
              <input
                type="text"
                disabled
                value="90% of row size"
                className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-100 border border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
              />
              <span className="text-[10px] text-slate-400">Excludes fields from charts if unique value count exceeds ratio</span>
            </div>
          </div>
        </div>

        {/* Connection settings */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-850">
            <Server size={18} className="text-slate-400" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">Engine API Host</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">FastAPI Server URL</label>
              <input
                type="text"
                value={apiHost}
                onChange={(e) => setApiHost(e.target.value)}
                className="w-full text-xs font-mono font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700"
              />
              <span className="text-[10px] text-slate-400">Base URL endpoint of the Python machine learning backend server</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save system settings button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={saveSettings}
          disabled={saveLoading}
          className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow hover:opacity-95"
        >
          {saveLoading ? "Saving Preferences..." : (
            <>
              <Check size={14} />
              Save Configuration
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Settings;
