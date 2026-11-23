import { AlertCircle, RefreshCw } from "lucide-react";
import type { RunningAppInfo } from "../types";
import type { Translations } from "../i18n";

interface RunningAppsBarProps {
  t: Translations;
  runningApps: RunningAppInfo[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function RunningAppsBar({
  t,
  runningApps,
  onRefresh,
  isRefreshing,
}: RunningAppsBarProps) {
  if (runningApps.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-amber-500/[0.07] border border-amber-500/20">
      <div className="flex flex-wrap items-center gap-2">
        {runningApps.map((app) => (
          <span
            key={app.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-200 text-xs font-medium"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{t.runningAppChip(app.displayName)}</span>
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        title={t.refreshApps}
        className="p-1.5 rounded-lg text-amber-300/80 hover:text-amber-200 hover:bg-amber-500/15 transition-colors cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}
