import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Sparkles, Loader2, ArrowRight, CheckCircle2, ChevronRight, HelpCircle, AlertCircle, Info } from "lucide-react";

function Recommendations({ datasetStatus, setDatasetStatus, setDatasetInfo, showToast }) {
  const [data, setData] = useState(null);
  const [cleanSummary, setCleanSummary] = useState(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (datasetStatus !== "none") {
      fetchRecommendationsAndSummary();
    } else {
      setIsLoading(false);
    }
  }, [datasetStatus]);

  const fetchRecommendationsAndSummary = async () => {
    setIsLoading(true);
    setError("");
    try {
      const recRes = await api.get("/recommendations");
      setData(recRes.data);

      if (datasetStatus === "cleaned" || datasetStatus === "trained") {
        const sumRes = await api.get("/clean/summary");
        setCleanSummary(sumRes.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch recommendations from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyCleaning = async () => {
    setIsCleaning(true);
    try {
      // 1. Post to apply cleaning
      const cleanRes = await api.post("/clean/apply");
      showToast("Data cleaning applied successfully!", "success");

      // 2. Fetch new profile structure after clean
      const profileRes = await api.get("/profile");
      setDatasetInfo(profileRes.data);

      // 3. Set status to cleaned
      setDatasetStatus("cleaned");

      // 4. Fetch the before/after clean summary
      const sumRes = await api.get("/clean/summary");
      setCleanSummary(sumRes.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to apply data cleaning. Try again.", "error");
    } finally {
      setIsCleaning(false);
    }
  };

  if (datasetStatus === "none") {
    return (
      <div className="glass-card rounded-2xl p-10 text-center max-w-xl mx-auto mt-12 dark:border-slate-800/80">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 dark:bg-slate-900 mb-5">
          <Info size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Recommendations Not Available</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
          Please upload a dataset first. Ingested dataset columns will be analyzed and AI cleanup suggestions will populate here.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-5 rounded-2xl dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-300 flex items-start gap-3">
        <AlertCircle className="shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">Error Loading Suggestions</h4>
          <p className="text-xs mt-1">{error || "Could not retrieve cleaning actions."}</p>
        </div>
      </div>
    );
  }

  const recommendations = data.recommendations || [];

  // Helper to determine priority
  const getPriority = (item) => {
    if (item.issue === "constant_column" || item.issue === "duplicate_rows") {
      return { label: "High", badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50" };
    }
    if (item.issue === "missing_values") {
      return { label: "Medium", badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50" };
    }
    return { label: "Low", badge: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700" };
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Cleaning Recommendations</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automated recommendations based on detected anomalies.
          </p>
        </div>

        {datasetStatus === "uploaded" && recommendations.length > 0 && (
          <button
            onClick={applyCleaning}
            disabled={isCleaning}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-75 cursor-pointer"
          >
            {isCleaning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Applying Cleanup...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Apply AI Data Cleaning
              </>
            )}
          </button>
        )}
      </div>

      {/* Before vs After Impact Visualization */}
      {cleanSummary && (
        <div className="glass-card rounded-2xl p-6 border border-emerald-200 bg-emerald-500/5 dark:border-emerald-900/50 space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={20} />
            <h3 className="font-bold text-sm">Dataset Successfully Sanitized</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Summary statistics comparison */}
            <div className="flex items-center justify-around bg-white/40 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Original Rows</span>
                <p className="text-2xl font-extrabold text-slate-600 dark:text-slate-400">
                  {cleanSummary.original_rows}
                </p>
              </div>

              <ChevronRight size={24} className="text-slate-300 dark:text-slate-700" />

              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-500">Cleaned Rows</span>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {cleanSummary.clean_rows}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-around bg-white/40 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Original Columns</span>
                <p className="text-2xl font-extrabold text-slate-600 dark:text-slate-400">
                  {cleanSummary.original_columns}
                </p>
              </div>

              <ChevronRight size={24} className="text-slate-300 dark:text-slate-700" />

              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-500">Cleaned Columns</span>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {cleanSummary.clean_columns}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      {recommendations.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center border border-slate-200/50 dark:border-slate-800/50">
          <p className="text-slate-500 dark:text-slate-400">
            No pending recommendations. Your dataset is already cleaned.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((item, index) => {
            const priority = getPriority(item);
            return (
              <div
                key={index}
                className="glass-card rounded-2xl p-5 border border-slate-200/50 hover:shadow-md transition-all dark:border-slate-800/50 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Column & Priority */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 px-2.5 py-1 rounded-lg">
                      column: {item.column}
                    </span>
                    <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${priority.badge}`}>
                      {priority.label} Priority
                    </span>
                  </div>

                  {/* Recommendation Details */}
                  <div className="space-y-1 mt-2">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                      {item.issue.replace("_", " ")} Detected
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                      {item.issue === "missing_values" && `Missing data found in '${item.column}'. Recommended resolution is to impute using column statistics.`}
                      {item.issue === "constant_column" && `Column '${item.column}' has zero variance (constant). Recommended action is to exclude.`}
                      {item.issue === "duplicate_rows" && `Identical records detected. Recommended action is to prune redundancy.`}
                      {item.issue === "outliers" && `Extreme outliers identified in '${item.column}'. Recommended thresholding or removal.`}
                      {item.issue === "high_cardinality" && `Too many distinct text values in '${item.column}' which reduces correlation significance.`}
                    </p>
                  </div>
                </div>

                {/* Proposed Fix Badge */}
                <div className="mt-4 pt-3 border-t border-slate-100/60 dark:border-slate-800/40 flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Proposed Fix:</span>
                  <span className="text-primary font-bold dark:text-primary-light flex items-center gap-1">
                    {item.recommendation}
                    <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Recommendations;