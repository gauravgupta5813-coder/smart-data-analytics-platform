import { useState } from "react";
import { Settings as SettingsIcon, Sliders, Server, ShieldAlert, Sparkles, Check } from "lucide-react";

function Settings({ showToast }) {
  // Mock settings stored in React state (simulating localStorage configuration)
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">System Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize machine learning parameters, outlier detection variables, and system preferences.
        </p>
      </div>

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

      {/* Save Button */}
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
