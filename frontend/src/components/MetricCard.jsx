import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

function MetricCard({
  title,
  value,
  description,
  trend,
  trendDirection = "up", // up | down | neutral
  icon: Icon,
  className = ""
}) {
  return (
    <div className={`glass-card rounded-2xl p-6 border border-slate-200/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group dark:border-slate-800/50 dark:hover:shadow-primary/5 ${className}`}>
      <div className="flex justify-between items-start">
        {/* Title and Description */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          <p className="text-3xl font-bold text-slate-800 tracking-tight dark:text-white mt-1">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>

        {/* Icon container */}
        {Icon && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-500 group-hover:text-primary group-hover:bg-primary/5 transition-all duration-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:group-hover:text-cyan-400 dark:group-hover:bg-cyan-500/5">
            <Icon size={20} className="transition-transform group-hover:scale-110" />
          </div>
        )}
      </div>

      {/* Footer / Trend Info */}
      {(trend || description) && (
        <div className="mt-4 pt-4 border-t border-slate-100/60 dark:border-slate-800/40 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg font-semibold ${
                trendDirection === "up"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : trendDirection === "down"
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                  : "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {trendDirection === "up" && <ArrowUpRight size={14} />}
              {trendDirection === "down" && <ArrowDownRight size={14} />}
              {trend}
            </span>
          )}
          {description && (
            <span className="text-slate-400 dark:text-slate-500 font-medium">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default MetricCard;