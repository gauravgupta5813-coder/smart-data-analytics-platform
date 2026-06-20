import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../services/api";

function Upload({ setDatasetStatus, setDatasetInfo, showToast }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Handle Drag Over
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);
      } else {
        showToast("Only CSV files are supported", "error");
      }
    }
  };

  // Handle File Input Change
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Trigger File Input Click
  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  // Upload File to FastAPI Backend
  const handleUpload = async () => {
    if (!file) {
      showToast("Please select a file to upload.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);

    try {
      // 1. Upload CSV file
      const uploadResponse = await api.post("/upload", formData);
      showToast("File uploaded successfully!", "success");

      // 2. Fetch dataset profile information immediately
      const profileResponse = await api.get("/profile");
      
      setDatasetInfo(profileResponse.data);
      setDatasetStatus("uploaded");
      
      setIsUploading(false);
      navigate("/"); // Redirect to overview dashboard
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.detail || "Upload failed. Please verify CSV format.";
      showToast(errMsg, "error");
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
          Upload Dataset
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Select or drag a tabular dataset (.csv) to initialize analytics models.
        </p>
      </div>

      {/* Main Drag-and-drop Card */}
      <div className="glass-card rounded-2xl p-8 border border-slate-200/50 dark:border-slate-800/50">
        <form
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onSubmit={(e) => e.preventDefault()}
          className="relative"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
          />

          <div
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-300 ${
              dragActive
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : file
                ? "border-emerald-300 bg-emerald-500/5 dark:border-emerald-800/50"
                : "border-slate-200 hover:border-slate-350 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900/30"
            }`}
          >
            {/* Display status icon */}
            {file ? (
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 dark:bg-emerald-950/20 mb-4 animate-fade-in-up">
                <FileSpreadsheet size={32} />
              </div>
            ) : (
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 dark:bg-slate-900 mb-4 group-hover:scale-105 transition-transform">
                <UploadCloud size={32} />
              </div>
            )}

            {file ? (
              <div className="text-center space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB &bull; Ready for ingestion
                </p>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Drag and drop your dataset here
                </p>
                <p className="text-xs text-slate-400">
                  Supported formats: CSV only (up to 50MB)
                </p>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={onButtonClick}
                    className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/10 cursor-pointer dark:bg-primary/10 dark:text-primary-light"
                  >
                    Browse Local Files
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Action Button Section */}
        {file && (
          <div className="mt-6 flex justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5 text-xs text-slate-500">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Correct file format recognized</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFile(null)}
                disabled={isUploading}
                className="px-4 py-2 border border-slate-205 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 transition-all cursor-pointer dark:border-slate-700 dark:hover:bg-slate-850"
              >
                Clear
              </button>
              
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 shadow-md shadow-primary/15 disabled:opacity-70 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>Ingest Dataset</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guide Card */}
      <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-5 dark:bg-slate-900/30 dark:border-slate-800/60 flex gap-4">
        <AlertCircle size={20} className="text-slate-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">
            Data Preparation Guidelines
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Ensure your CSV file contains column names in the first row. Categorical variables will be hot-encoded automatically by the ML processor. Missing records will be analyzed and repair paths suggested on the quality panel.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Upload;