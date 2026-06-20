import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BrainCircuit, Cpu, Loader2, Award, Zap, HelpCircle, BarChart3, LineChart, Info, Play, ChevronRight } from "lucide-react";

function ML({ datasetStatus, setDatasetStatus, datasetInfo, mlMetrics, setMlMetrics, showToast }) {
  const [columns, setColumns] = useState([]);
  const [target, setTarget] = useState("");
  const [isTraining, setIsTraining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (datasetStatus !== "none") {
      fetchColumns();
    } else {
      setIsLoading(false);
    }
  }, [datasetStatus]);

  const fetchColumns = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/profile");
      const allColumns = [
        ...(response.data.numeric_columns || []),
        ...(response.data.categorical_columns || [])
      ];
      setColumns(allColumns);

      // Default target selection
      if (allColumns.length > 0) {
        setTarget(allColumns[allColumns.length - 1]); // Choose last column as target by default
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch column profiles from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const trainModel = async () => {
    if (!target) {
      showToast("Please choose a target variable first", "error");
      return;
    }

    setIsTraining(true);
    try {
      const response = await api.post("/train", {
        target_column: target
      });
      
      showToast("Model trained successfully!", "success");
      setMlMetrics(response.data);
      setDatasetStatus("trained");
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || "Model training failed. Verify selected targets.";
      showToast(errMsg, "error");
    } finally {
      setIsTraining(false);
    }
  };

  if (datasetStatus === "none") {
    return (
      <div className="glass-card rounded-2xl p-10 text-center max-w-xl mx-auto mt-12 dark:border-slate-800/80">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 dark:bg-slate-900 mb-5">
          <Info size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Machine Learning Not Available</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
          Please upload a dataset first. Once loaded, you will be able to configure target columns, choose models, and train predictor machines.
        </p>
        <Link
          to="/upload"
          className="mt-6 inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
        >
          Go to Upload
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-5 rounded-2xl dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-300 flex items-start gap-3">
        <Info className="shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">Model Workspace Error</h4>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Determine Target Datatype
  const isTargetNumeric = datasetInfo?.numeric_columns?.includes(target);
  const problemType = isTargetNumeric ? "Regression" : "Classification";

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Machine Learning Workspace</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure target columns and train high-performance Random Forest models.
          </p>
        </div>
      </div>

      {/* Grid: Target configuration and Model Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ML Configuration Box */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-6 self-start">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-850">
            <Cpu size={18} className="text-slate-400" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">Model Configuration</h3>
          </div>

          <div className="space-y-4">
            {/* Target Column Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target Variable (y)</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700"
              >
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Inferred problem type banner */}
            <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-3.5 dark:bg-slate-900/30 dark:border-slate-800/50 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-450">Inferred Task Type:</span>
              <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                {problemType} Random Forest
              </p>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                {isTargetNumeric
                  ? "Target is numeric. Fitting RandomForestRegressor with MSE splitting thresholds."
                  : "Target is categorical/object. Fitting RandomForestClassifier with Gini impurity splitting."}
              </p>
            </div>

            {/* Run Button */}
            <button
              onClick={trainModel}
              disabled={isTraining}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/15 disabled:opacity-75 cursor-pointer"
            >
              {isTraining ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Training Estimator...
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  Train Machine Model
                </>
              )}
            </button>
          </div>
        </div>

        {/* Selected Model Details card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Random Forest Model Specs</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 dark:bg-slate-900/30 dark:border-slate-800/40">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Number of Estimators</h4>
              <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">100 Decision Trees</p>
              <p className="text-[10px] text-slate-400 mt-1">Bootstrapped bagging ensemble size</p>
            </div>
            
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 dark:bg-slate-900/30 dark:border-slate-800/40">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Data Partition Ratio</h4>
              <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">80% Train / 20% Test</p>
              <p className="text-[10px] text-slate-400 mt-1">Random state split seed 42</p>
            </div>

            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 dark:bg-slate-900/30 dark:border-slate-800/40">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Preprocessing Path</h4>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 mt-1">Mode/Median Imputation + One-Hot Encoding</p>
              <p className="text-[10px] text-slate-400 mt-1">Categorical variables encoded as numeric dummies</p>
            </div>

            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 dark:bg-slate-900/30 dark:border-slate-800/40">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Estimated Hyperparameters</h4>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 mt-1">Bootstrap=True, Max_Features='sqrt'</p>
              <p className="text-[10px] text-slate-400 mt-1">Optimal settings for general tabular benchmarks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Training Metrics Overlay */}
      {mlMetrics && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Performance Metrics Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Validation Performance Metrics</h3>
            
            {mlMetrics.problem_type === "Regression" ? (
              /* Regression Performance Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">R² Score (Coefficient of Determination)</span>
                    <p className="text-3xl font-extrabold text-slate-850 dark:text-white mt-1">{mlMetrics.r2_score}</p>
                    <p className="text-xs text-slate-500">Proportion of variance explained by features</p>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-2xl text-primary">
                    <Award size={28} />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mean Absolute Error (MAE)</span>
                    <p className="text-3xl font-extrabold text-slate-850 dark:text-white mt-1">{mlMetrics.mae}</p>
                    <p className="text-xs text-slate-500">Average absolute difference between target and prediction</p>
                  </div>
                  <div className="bg-secondary/5 p-4 rounded-2xl text-secondary">
                    <Zap size={28} />
                  </div>
                </div>
              </div>
            ) : (
              /* Classification Performance Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy Score</span>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{mlMetrics.accuracy}</p>
                  <p className="text-[10px] text-slate-450 mt-1">Ratio of correctly classified samples</p>
                </div>
                
                <div className="glass-card rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Precision (Weighted)</span>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{mlMetrics.precision}</p>
                  <p className="text-[10px] text-slate-450 mt-1">Ability to avoid false positives</p>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recall (Weighted)</span>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{mlMetrics.recall}</p>
                  <p className="text-[10px] text-slate-450 mt-1">Ability to capture all positive cases</p>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">F1-Score (Weighted)</span>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{mlMetrics.f1_score}</p>
                  <p className="text-[10px] text-slate-450 mt-1">Harmonic mean of precision and recall</p>
                </div>
              </div>
            )}
          </div>

          {/* Feature Importance Interactive Chart */}
          {mlMetrics.feature_importances && mlMetrics.feature_importances.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Feature Importance Rankings</h3>
                  <p className="text-xs text-slate-400">Relative contribution weights computed via Random Forest node splits</p>
                </div>
                
                <Link
                  to="/prediction"
                  className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow hover:opacity-90"
                >
                  Go to Predictions Page
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="h-[350px] w-full pt-4">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={mlMetrics.feature_importances.slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                    <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                    <Tooltip />
                    <Bar dataKey="importance" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ML;