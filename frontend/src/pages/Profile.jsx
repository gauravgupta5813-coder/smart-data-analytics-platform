import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import MetricCard from "../components/MetricCard";
import { Grid, Columns, FileSpreadsheet, Eye, HelpCircle, ArrowRightLeft, Info, AlertTriangle } from "lucide-react";

function Profile({ datasetStatus, datasetInfo, setDatasetInfo }) {
  const [profile, setProfile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (datasetStatus !== "none") {
      fetchProfileAndPreview();
    } else {
      setIsLoading(false);
    }
  }, [datasetStatus]);

  const fetchProfileAndPreview = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Fetch profile summary info
      const profileRes = await api.get("/profile");
      setProfile(profileRes.data);
      if (setDatasetInfo) {
        setDatasetInfo(profileRes.data);
      }

      // Fetch row-level preview (first 10 records)
      const previewRes = await api.get("/preview");
      if (Array.isArray(previewRes.data)) {
        setPreviewRows(previewRes.data);
      } else if (previewRes.data?.error) {
        setError(previewRes.data.error);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to backend engine. Is FastAPI running?");
    } finally {
      setIsLoading(false);
    }
  };

  if (datasetStatus === "none") {
    return (
      <div className="glass-card rounded-2xl p-10 text-center max-w-xl mx-auto mt-12 dark:border-slate-800/80">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 dark:bg-slate-900 mb-5">
          <Info size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Dataset Profile Not Available</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
          Please upload a dataset first. Once ingested, this panel will display metadata breakdowns and data-grid previews.
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-5 rounded-2xl dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-300 flex items-start gap-3">
        <AlertTriangle className="shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">Ingestion Error</h4>
          <p className="text-xs mt-1">{error || "Could not retrieve profile statistics."}</p>
        </div>
      </div>
    );
  }

  const totalMissingValues = Object.values(profile.missing_values || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Dataset Profile</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep overview of columns, datatypes, and data distribution.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <MetricCard title="Rows" value={profile.rows} icon={Grid} />
        <MetricCard title="Columns" value={profile.columns} icon={Columns} />
        <MetricCard
          title="Missing Values"
          value={totalMissingValues}
          className={totalMissingValues > 0 ? "border-amber-200 dark:border-amber-900/50" : ""}
          icon={AlertTriangle}
        />
        <MetricCard title="Numeric Features" value={profile.numeric_columns.length} icon={FileSpreadsheet} />
        <MetricCard title="Categorical Features" value={profile.categorical_columns.length} icon={ArrowRightLeft} />
      </div>

      {/* Data Type Distribution */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Feature Types Distribution</h3>
        
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
          <div className="flex items-center gap-1.5 mr-4">
            <span className="w-3 h-3 bg-primary rounded" />
            <span>Numeric ({profile.numeric_columns.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-secondary rounded" />
            <span>Categorical ({profile.categorical_columns.length})</span>
          </div>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-lg overflow-hidden flex">
          <div
            className="bg-primary h-full transition-all duration-500"
            style={{ width: `${(profile.numeric_columns.length / profile.columns) * 100}%` }}
            title={`Numeric: ${profile.numeric_columns.length}`}
          />
          <div
            className="bg-secondary h-full transition-all duration-500"
            style={{ width: `${(profile.categorical_columns.length / profile.columns) * 105}%` }}
            title={`Categorical: ${profile.categorical_columns.length}`}
          />
        </div>
      </div>

      {/* Spreadsheet Data Grid Preview */}
      {previewRows.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Ingested Dataset Preview</h3>
              <p className="text-xs text-slate-400">Displaying the first 10 rows of the active dataset session</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-500 dark:bg-slate-850 dark:text-slate-400 px-2.5 py-1 rounded-lg font-mono">
              Limit 10 records
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-150 rounded-xl dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 dark:bg-slate-900/60 dark:border-slate-800 text-slate-500">
                  <th className="p-3 font-semibold w-12 text-center">#</th>
                  {Object.keys(previewRows[0]).map((col) => (
                    <th key={col} className="p-3 font-semibold select-none truncate max-w-[150px]">
                      <div className="flex items-center gap-1">
                        <span className="truncate">{col}</span>
                        <span className="text-[9px] px-1 bg-slate-200/60 text-slate-500 rounded font-mono uppercase dark:bg-slate-800 dark:text-slate-400">
                          {profile.numeric_columns.includes(col) ? "num" : "cat"}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
                {previewRows.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 odd:bg-white/40 dark:odd:bg-slate-950/20"
                  >
                    <td className="p-3 text-center text-slate-400 font-mono border-r border-slate-100 dark:border-slate-800">
                      {index + 1}
                    </td>
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="p-3 font-mono truncate max-w-[150px]" title={val?.toString()}>
                        {val === null || val === undefined ? (
                          <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1 rounded dark:bg-rose-950/20">
                            NaN
                          </span>
                        ) : (
                          val.toString()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feature Breakdown Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Numeric Columns details */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Numeric Features</h3>
          <div className="overflow-hidden border border-slate-150 rounded-xl dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 dark:bg-slate-900/60 dark:border-slate-800 text-slate-500">
                  <th className="p-3 font-semibold">Column Name</th>
                  <th className="p-3 font-semibold text-center">Missing Count</th>
                  <th className="p-3 font-semibold text-right">Datatype</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
                {profile.numeric_columns.map((col) => {
                  const missingCount = profile.missing_values[col] || 0;
                  return (
                    <tr key={col} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                      <td className="p-3 font-semibold">{col}</td>
                      <td className="p-3 text-center">
                        {missingCount > 0 ? (
                          <span className="px-2 py-0.5 rounded text-amber-700 bg-amber-50 font-bold dark:bg-amber-950/30 dark:text-amber-400">
                            {missingCount}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">0</span>
                        )}
                      </td>
                      <td className="p-3 text-right text-slate-400 font-mono">float / int</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Categorical Columns details */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Categorical Features</h3>
          <div className="overflow-hidden border border-slate-150 rounded-xl dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 dark:bg-slate-900/60 dark:border-slate-800 text-slate-500">
                  <th className="p-3 font-semibold">Column Name</th>
                  <th className="p-3 font-semibold text-center">Missing Count</th>
                  <th className="p-3 font-semibold text-right">Datatype</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
                {profile.categorical_columns.map((col) => {
                  const missingCount = profile.missing_values[col] || 0;
                  return (
                    <tr key={col} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                      <td className="p-3 font-semibold">{col}</td>
                      <td className="p-3 text-center">
                        {missingCount > 0 ? (
                          <span className="px-2 py-0.5 rounded text-amber-700 bg-amber-50 font-bold dark:bg-amber-950/30 dark:text-amber-400">
                            {missingCount}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">0</span>
                        )}
                      </td>
                      <td className="p-3 text-right text-slate-400 font-mono">object / string</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;