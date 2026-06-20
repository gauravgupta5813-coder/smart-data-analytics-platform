import React from "react";
import { Link } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import {
  FileSpreadsheet,
  Columns,
  Grid,
  AlertTriangle,
  Layers,
  Sparkles,
  PlayCircle,
  HelpCircle,
  Database,
  Eye,
  LineChart,
  BrainCircuit
} from "lucide-react";

function Overview({ datasetStatus, datasetInfo, showToast }) {
  const isLoaded = datasetStatus !== "none" && datasetInfo;

  // Compute Missing Value Sum
  const totalMissing = isLoaded
    ? Object.values(datasetInfo.missing_values || {}).reduce((a, b) => a + b, 0)
    : 0;

  // Compute Numeric and Categorical count
  const numNumeric = isLoaded ? (datasetInfo.numeric_columns?.length || 0) : 0;
  const numCategorical = isLoaded ? (datasetInfo.categorical_columns?.length || 0) : 0;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            Dashboard Overview
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics engine and data health status monitor.
          </p>
        </div>
        
        {isLoaded && (
          <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-800 flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            Active Session
          </div>
        )}
      </div>

      {/* Conditional Rendering based on state */}
      {!isLoaded ? (
        /* Empty State Illustration */
        <div className="glass-card rounded-3xl border border-slate-200/60 p-12 text-center max-w-2xl mx-auto mt-12 dark:border-slate-800/80">
          <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto text-primary dark:bg-primary/10 mb-6">
            <Database size={40} className="animate-bounce" />
          </div>
          
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
            No dataset loaded
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto text-sm leading-relaxed">
            Upload a CSV file to generate detailed dataset profiling, data quality analysis, automated cleaning suggestions, interactive plotting, and random forest predictive models.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] transition-all duration-300 shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              Upload your first dataset
            </Link>
          </div>
        </div>
      ) : (
        /* Populated Dashboard Overview */
        <div className="space-y-8">
          {/* Key Metric Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Rows"
              value={datasetInfo.rows}
              description="Records loaded in memory"
              trend="Stable"
              trendDirection="neutral"
              icon={Grid}
            />
            <MetricCard
              title="Total Columns"
              value={datasetInfo.columns}
              description="Features in dataset"
              trend={`+${numNumeric + numCategorical}`}
              trendDirection="up"
              icon={Columns}
            />
            <MetricCard
              title="Missing Value Count"
              value={totalMissing}
              description="Data quality issues"
              trend={totalMissing > 0 ? "Needs repair" : "Perfect health"}
              trendDirection={totalMissing > 0 ? "down" : "up"}
              className={totalMissing > 0 ? "border-amber-200/50 hover:shadow-amber-500/5" : ""}
              icon={AlertTriangle}
            />
            <MetricCard
              title="ML Model Status"
              value={datasetStatus === "trained" ? "TRAINED" : "READY TO TRAIN"}
              description={datasetStatus === "trained" ? "Random Forest active" : "Needs target configuration"}
              trend={datasetStatus === "trained" ? "Active" : "Pending"}
              trendDirection={datasetStatus === "trained" ? "up" : "neutral"}
              className={datasetStatus === "trained" ? "border-indigo-200/50 hover:shadow-indigo-500/5" : ""}
              icon={BrainCircuit}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Breakdown Card */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                Dataset Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columns breakdown */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Numeric Columns</span>
                    <span className="font-semibold">{numNumeric}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{
                        width: `${(numNumeric / (numNumeric + numCategorical || 1)) * 100}%`
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm pt-2">
                    <span className="text-slate-500">Categorical Columns</span>
                    <span className="font-semibold">{numCategorical}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-secondary h-full rounded-full"
                      style={{
                        width: `${(numCategorical / (numNumeric + numCategorical || 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {/* Health Rating Card */}
                <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100 flex flex-col justify-between dark:bg-slate-900/30 dark:border-slate-800/50">
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      Dataset Quality Score
                    </h4>
                    <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
                      {totalMissing > 0 || (datasetInfo.duplicate_rows || 0) > 0 ? "78%" : "100%"}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {totalMissing > 0
                      ? `Detected ${totalMissing} missing values and ${datasetInfo.duplicate_rows || 0} duplicates. Recommend running AI cleaner.`
                      : "Zero anomalies detected. Data is ready for analysis and machine learning training."}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="flex flex-col gap-3">
                <Link
                  to="/profile"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:hover:bg-slate-900 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Eye size={18} className="text-slate-400 group-hover:text-primary" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Explore Dataset
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">&rarr;</span>
                </Link>

                <Link
                  to="/recommendations"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:hover:bg-slate-900 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={18} className="text-slate-400 group-hover:text-cyan-500" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Clean Dataset
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">&rarr;</span>
                </Link>

                <Link
                  to="/visualizations"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:hover:bg-slate-900 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <LineChart size={18} className="text-slate-400 group-hover:text-emerald-500" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Plot Visualizations
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">&rarr;</span>
                </Link>

                <Link
                  to="/ml"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 hover:bg-indigo-50/50 hover:border-indigo-300 dark:border-slate-800 dark:hover:bg-indigo-950/20 dark:hover:border-indigo-900/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <BrainCircuit size={18} className="text-slate-400 group-hover:text-indigo-500" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Train Predictor Model
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Overview;
