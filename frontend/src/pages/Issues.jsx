import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import MetricCard from "../components/MetricCard";
import {
  ShieldAlert,
  AlertOctagon,
  Copy,
  FolderMinus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart4
} from "lucide-react";

function Issues({ datasetStatus, datasetInfo }) {
  const [issues, setIssues] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (datasetStatus !== "none") {
      fetchIssues();
    } else {
      setIsLoading(false);
    }
  }, [datasetStatus]);

  const fetchIssues = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/issues");
      setIssues(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data quality issues from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  if (datasetStatus === "none") {
    return (
      <div className="glass-card rounded-2xl p-10 text-center max-w-xl mx-auto mt-12 dark:border-slate-800/80">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 dark:bg-slate-900 mb-5">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Issues Diagnostic Not Available</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
          Please upload a dataset first. Ingested dataset columns will be scanned for duplicate rows, constant fields, and numerical outlier values.
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (error || !issues) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-5 rounded-2xl dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-300 flex items-start gap-3">
        <AlertCircle className="shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">Diagnostic Error</h4>
          <p className="text-xs mt-1">{error || "Could not retrieve data health diagnostics."}</p>
        </div>
      </div>
    );
  }

  const missingColCount = Object.keys(issues.missing_values || {}).length;
  const outlierColCount = Object.keys(issues.outliers || {}).length;
  const constantColCount = issues.constant_columns?.length || 0;
  const highCardinalityCount = issues.high_cardinality_columns?.length || 0;
  const duplicateRowCount = issues.duplicate_rows || 0;
  const totalRows = datasetInfo?.rows || 1;

  // Determine Outlier Severity
  const getOutlierSeverity = (count) => {
    const percentage = (count / totalRows) * 100;
    if (percentage > 10) return { label: "High", style: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50" };
    if (percentage > 3) return { label: "Medium", style: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50" };
    return { label: "Low", style: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50" };
  };

  const hasIssues = missingColCount > 0 || outlierColCount > 0 || constantColCount > 0 || duplicateRowCount > 0;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Data Quality Issues</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automated outlier screening, duplicate scans, and missing entry diagnostics.
          </p>
        </div>
        
        {hasIssues && (
          <Link
            to="/recommendations"
            className="bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={14} />
            View Cleaning Recommendations
          </Link>
        )}
      </div>

      {/* Global Quality Banner */}
      {!hasIssues ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-300 flex gap-4">
          <CheckCircle2 size={24} className="text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Perfect Data Health Detected!</h4>
            <p className="text-xs leading-relaxed">
              No duplicate records, missing cells, or outliers have been detected. Your dataset is clean and primed for plotting and building predictive models.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-300 flex gap-4">
          <AlertOctagon size={24} className="text-amber-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Data Anomaly Report Generated</h4>
            <p className="text-xs leading-relaxed">
              Some inconsistencies have been detected. An AI-backed cleanup recommendation can help impute missing entries and prune outliers. Review details below.
            </p>
          </div>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Missing Value Columns"
          value={missingColCount}
          description="Features lacking full cells"
          icon={ShieldAlert}
          className={missingColCount > 0 ? "border-amber-200/50" : ""}
        />
        <MetricCard
          title="Outlier Columns"
          value={outlierColCount}
          description="Fields with numerical extremes"
          icon={BarChart4}
          className={outlierColCount > 0 ? "border-rose-200/50" : ""}
        />
        <MetricCard
          title="Constant Columns"
          value={constantColCount}
          description="Columns containing 1 unique value"
          icon={FolderMinus}
        />
        <MetricCard
          title="Duplicate Rows"
          value={duplicateRowCount}
          description="Redundant dataset records"
          icon={Copy}
          className={duplicateRowCount > 0 ? "border-amber-200/50" : ""}
        />
      </div>

      {/* Two column diagnostics layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Missing Values Breakdown */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Missing Values Analysis</h3>
          
          {missingColCount === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No missing values detected</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(issues.missing_values).map(([col, count]) => {
                const percentage = ((count / totalRows) * 100).toFixed(1);
                return (
                  <div key={col} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-350">{col}</span>
                      <span className="text-slate-400">
                        {count} / {totalRows} rows ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Numerical Outliers Detection */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Outlier Detection Details</h3>
          
          {outlierColCount === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No outliers detected in numerical columns</p>
          ) : (
            <div className="overflow-hidden border border-slate-150 rounded-xl dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 dark:bg-slate-900/60 dark:border-slate-800 text-slate-500">
                    <th className="p-3 font-semibold">Numerical Column</th>
                    <th className="p-3 font-semibold text-center">Outlier Count</th>
                    <th className="p-3 font-semibold text-right">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
                  {Object.entries(issues.outliers).map(([col, count]) => {
                    const severity = getOutlierSeverity(count);
                    return (
                      <tr key={col} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                        <td className="p-3 font-semibold">{col}</td>
                        <td className="p-3 text-center font-mono">{count}</td>
                        <td className="p-3 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${severity.style}`}>
                            {severity.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Structural issues card */}
      {(constantColCount > 0 || highCardinalityCount > 0) && (
        <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Structural Anomalies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Constant columns */}
            {constantColCount > 0 && (
              <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-4 dark:bg-slate-900/30 dark:border-slate-800/50 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Constant Columns</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  These columns contain only one unique value across all rows and contribute no variance to models:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {issues.constant_columns.map((col) => (
                    <span key={col} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-mono">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* High Cardinality */}
            {highCardinalityCount > 0 && (
              <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-4 dark:bg-slate-900/30 dark:border-slate-800/50 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">High Cardinality Columns</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  These fields contain unique values for almost every record (e.g. IDs, hashes) and should be excluded:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {issues.high_cardinality_columns.map((col) => (
                    <span key={col} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-mono">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Issues;