import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Download, Sliders, Image, BarChart3, HelpCircle, Eye, Info, RefreshCw, Loader2 } from "lucide-react";

function Visualizations({ datasetStatus, datasetInfo }) {
  const [numericColumns, setNumericColumns] = useState([]);
  const [categoricalColumns, setCategoricalColumns] = useState([]);
  
  const [column, setColumn] = useState("");
  const [activeTab, setActiveTab] = useState("histogram"); // histogram, boxplot, bar, heatmap, interactive
  
  const [chartUrl, setChartUrl] = useState("");
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [chartError, setChartError] = useState("");

  // Recharts interactive states
  const [rechartsType, setRechartsType] = useState("scatter"); // scatter | bar | line
  const [xAxisCol, setXAxisCol] = useState("");
  const [yAxisCol, setYAxisCol] = useState("");
  const [previewRows, setPreviewRows] = useState([]);

  useEffect(() => {
    if (datasetStatus !== "none") {
      loadColumnsAndPreview();
    }
  }, [datasetStatus]);

  // Load columns on dataset status change
  const loadColumnsAndPreview = async () => {
    try {
      const response = await api.get("/profile");
      const numCols = response.data.numeric_columns || [];
      const catCols = response.data.categorical_columns || [];
      
      setNumericColumns(numCols);
      setCategoricalColumns(catCols);

      const allCols = [...numCols, ...catCols];
      if (allCols.length > 0) {
        setColumn(allCols[0]);
      }
      if (numCols.length > 0) {
        setXAxisCol(numCols[0]);
        setYAxisCol(numCols[Math.min(1, numCols.length - 1)]);
      } else if (allCols.length > 1) {
        setXAxisCol(allCols[0]);
        setYAxisCol(allCols[1]);
      }

      // Load preview for Recharts interactive rendering
      const previewRes = await api.get("/preview");
      if (Array.isArray(previewRes.data)) {
        setPreviewRows(previewRes.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Trigger chart generation in backend
  const generateChart = async (type, colName) => {
    setIsLoadingChart(true);
    setChartError("");
    setChartUrl("");
    try {
      let res;
      if (type === "heatmap") {
        res = await api.get("/heatmap");
      } else if (type === "histogram") {
        res = await api.get(`/histogram/${colName}`);
      } else if (type === "boxplot") {
        res = await api.get(`/boxplot/${colName}`);
      } else if (type === "bar") {
        res = await api.get(`/bar/${colName}`);
      }
      
      if (res && res.data && res.data.chart) {
        // Construct full URL from static mount
        const timestamp = new Date().getTime(); // Avoid browser cache
        setChartUrl(`http://127.0.0.1:8000/${res.data.chart}?t=${timestamp}`);
      }
    } catch (err) {
      console.error(err);
      setChartError(err.response?.data?.detail || "Failed to render chart image. Confirm numeric requirements.");
    } finally {
      setIsLoadingChart(false);
    }
  };

  // Generate charts when tab or column changes
  useEffect(() => {
    if (datasetStatus !== "none" && column && activeTab !== "interactive") {
      generateChart(activeTab, column);
    }
  }, [column, activeTab, datasetStatus]);

  // Download chart handler
  const downloadChart = async () => {
    if (!chartUrl) return;
    try {
      const response = await fetch(chartUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${column || "chart"}_${activeTab}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download image", err);
    }
  };

  if (datasetStatus === "none") {
    return (
      <div className="glass-card rounded-2xl p-10 text-center max-w-xl mx-auto mt-12 dark:border-slate-800/80">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 dark:bg-slate-900 mb-5">
          <Info size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Visualizations Not Available</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
          Please upload a dataset first. Once loaded, you can plot numerical histograms, boxplots, category bars, and correlation heatmaps.
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

  const allColumns = [...numericColumns, ...categoricalColumns];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Dataset Visualizations</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Matplotlib statistical graphs and interactive frontend charts.
          </p>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: "histogram", label: "Histogram (Numeric)" },
          { id: "boxplot", label: "Box Plot (Numeric)" },
          { id: "bar", label: "Bar Chart (Category)" },
          { id: "heatmap", label: "Correlation Heatmap" },
          { id: "interactive", label: "Interactive Recharts" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-500 hover:bg-slate-105 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Control Panel and Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Controls */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-6 self-start">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-850">
            <Sliders size={16} className="text-slate-400" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">Plot Controls</h3>
          </div>

          {activeTab !== "heatmap" && activeTab !== "interactive" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target Column</label>
              <select
                value={column}
                onChange={(e) => setColumn(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700"
              >
                {/* Filter dropdown variables based on selected tab */}
                {activeTab === "bar"
                  ? allColumns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))
                  : numericColumns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
              </select>
            </div>
          )}

          {activeTab === "heatmap" && (
            <div className="text-xs text-slate-500 leading-relaxed space-y-2">
              <p>Correlation metrics quantify how numeric variables co-move.</p>
              <p className="bg-slate-50 dark:bg-slate-900 p-2.5 border border-slate-100 dark:border-slate-800 rounded-lg font-mono text-[10px]">
                Requires at least 2 numeric fields in dataset.
              </p>
            </div>
          )}

          {activeTab === "interactive" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Chart Style</label>
                <div className="grid grid-cols-3 gap-1">
                  {["scatter", "bar", "line"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setRechartsType(t)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border cursor-pointer ${
                        rechartsType === t
                          ? "bg-primary text-white border-primary"
                          : "border-slate-205 text-slate-500 hover:bg-slate-50 dark:border-slate-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">X Axis (Numeric)</label>
                <select
                  value={xAxisCol}
                  onChange={(e) => setXAxisCol(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700"
                >
                  {numericColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Y Axis (Numeric)</label>
                <select
                  value={yAxisCol}
                  onChange={(e) => setYAxisCol(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700"
                >
                  {numericColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Chart Viewport */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 lg:col-span-3 min-h-[450px] flex flex-col justify-between">
          {activeTab !== "interactive" ? (
            /* Matplotlib Gallery view */
            <div className="space-y-6 flex-grow flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">
                  {activeTab === "heatmap" ? "Correlation Heatmap" : `${activeTab} - ${column}`}
                </h4>
                
                {chartUrl && (
                  <button
                    onClick={downloadChart}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer dark:border-slate-750 dark:text-slate-350 dark:hover:bg-slate-800"
                  >
                    <Download size={14} />
                    Export Chart
                  </button>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center border border-slate-100 rounded-xl bg-slate-50/20 p-4 min-h-[350px] dark:border-slate-850 dark:bg-slate-900/10">
                {isLoadingChart && (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span className="text-xs text-slate-400">Rendering high-res graph...</span>
                  </div>
                )}

                {chartError && (
                  <div className="flex flex-col items-center gap-2 max-w-sm text-center text-rose-500 font-semibold">
                    <Info size={32} />
                    <span className="text-xs">{chartError}</span>
                  </div>
                )}

                {!isLoadingChart && !chartError && chartUrl && (
                  <img
                    src={chartUrl}
                    alt="Visualization Chart"
                    className="max-h-[380px] object-contain rounded-lg shadow-sm"
                  />
                )}
              </div>
            </div>
          ) : (
            /* Interactive Recharts view */
            <div className="space-y-6 flex-grow flex flex-col justify-between h-full">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">
                  Interactive Plot: {yAxisCol} vs {xAxisCol}
                </h4>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono dark:bg-slate-800">
                  {rechartsType.toUpperCase()}
                </span>
              </div>

              <div className="flex-grow min-h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height={350}>
                  {rechartsType === "scatter" ? (
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                      <XAxis type="number" dataKey={xAxisCol} name={xAxisCol} stroke="#94a3b8" fontSize={11} />
                      <YAxis type="number" dataKey={yAxisCol} name={yAxisCol} stroke="#94a3b8" fontSize={11} />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Legend />
                      <Scatter name="Data Points" data={previewRows} fill="#4F46E5" />
                    </ScatterChart>
                  ) : rechartsType === "bar" ? (
                    <RechartsBarChart data={previewRows} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                      <XAxis dataKey={xAxisCol} stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey={yAxisCol} fill="#06B6D4" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  ) : (
                    <RechartsLineChart data={previewRows} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                      <XAxis dataKey={xAxisCol} stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey={yAxisCol} stroke="#10B981" strokeWidth={2} activeDot={{ r: 6 }} />
                    </RechartsLineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Visualizations;