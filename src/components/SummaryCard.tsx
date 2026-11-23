import { Search, Trash2, Zap, Flame, Loader2, Shield } from "lucide-react";
import type {
  CleanProgressEvent,
  Language,
  ProfileId,
  ScanProgressEvent,
} from "../types";
import type { Translations } from "../i18n";
import { formatBytes, formatNumber } from "../utils/format";

interface SummaryCardProps {
  t: Translations;
  lang: Language;
  hasScanned: boolean;
  isScanning: boolean;
  isCleaning: boolean;
  totalFoundBytes: number;
  totalFoundFiles: number;
  selectedBytes: number;
  selectedFiles: number;
  selectedCount: number;
  activeProfile: ProfileId;
  scanProgress: ScanProgressEvent | null;
  cleanProgress: CleanProgressEvent | null;
  onScan: () => void;
  onRequestClean: () => void;
  onSelectProfile: (profile: "quick" | "deep") => void;
}

export function SummaryCard({
  t,
  lang,
  hasScanned,
  isScanning,
  isCleaning,
  totalFoundBytes,
  totalFoundFiles,
  selectedBytes,
  selectedFiles,
  selectedCount,
  activeProfile,
  scanProgress,
  cleanProgress,
  onScan,
  onRequestClean,
  onSelectProfile,
}: SummaryCardProps) {
  const isBusy = isScanning || isCleaning;

  let progressPercent = 0;
  let progressText = "";

  if (isScanning && scanProgress && scanProgress.total > 0) {
    progressPercent = Math.round((scanProgress.completed / scanProgress.total) * 100);
    progressText = t.scanProgressLabel(scanProgress.completed, scanProgress.total);
  } else if (isCleaning && cleanProgress && cleanProgress.total > 0) {
    progressPercent = Math.round((cleanProgress.completed / cleanProgress.total) * 100);
    progressText = t.cleanProgressLabel(
      cleanProgress.completed,
      cleanProgress.total,
      formatBytes(cleanProgress.cleanedBytesSoFar)
    );
  }

  return (
    <section className="rounded-2xl bg-[#11151f] border border-slate-800/90 p-5 shadow-xl shadow-black/20 space-y-5">
      {/* Metrics + Primary Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex flex-wrap items-center gap-6">
          {/* Selected to clean */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              {t.selectedToClean}
            </p>
            <div className="mt-1 flex items-baseline gap-2.5">
              <span className="text-3xl font-bold tracking-tight text-cyan-400 tabular-nums">
                {hasScanned ? formatBytes(selectedBytes) : "—"}
              </span>
              {hasScanned && (
                <span className="text-xs text-slate-400 tabular-nums">
                  {formatNumber(selectedFiles, lang)} {t.filesLabel} · {selectedCount}{" "}
                  {t.targetsLabel}
                </span>
              )}
            </div>
          </div>

          {hasScanned && (
            <div className="pl-6 border-l border-slate-800">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {t.totalFound}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-semibold text-slate-200 tabular-nums">
                  {formatBytes(totalFoundBytes)}
                </span>
                <span className="text-xs text-slate-500 tabular-nums">
                  ({formatNumber(totalFoundFiles, lang)} {t.filesLabel})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={onScan}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700/80 text-slate-100 text-sm font-medium transition-all cursor-pointer"
          >
            {isScanning ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            ) : (
              <Search className="w-4 h-4 text-cyan-400" />
            )}
            <span>{isScanning ? t.scanning : hasScanned ? t.rescan : t.scan}</span>
          </button>

          <button
            type="button"
            disabled={isBusy || !hasScanned || selectedCount === 0}
            onClick={onRequestClean}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:border disabled:border-slate-700/60 disabled:cursor-not-allowed text-slate-950 text-sm font-semibold shadow-lg shadow-cyan-500/15 transition-all cursor-pointer"
          >
            {isCleaning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>{isCleaning ? t.cleaning : t.cleanSelected}</span>
          </button>
        </div>
      </div>

      {/* Live Progress Bar */}
      {isBusy && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{progressText || (isScanning ? t.scanning : t.cleaning)}</span>
            <span className="tabular-nums font-medium text-cyan-400">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800/90 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-200"
              style={{ width: `${Math.max(progressPercent, 6)}%` }}
            />
          </div>
        </div>
      )}

      {/* Preset Profiles + Safety Note */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-1">
            {t.profilesLabel}:
          </span>

          <button
            type="button"
            disabled={isBusy}
            onClick={() => onSelectProfile("quick")}
            title={t.quickProfileDesc}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer disabled:opacity-50 ${
              activeProfile === "quick"
                ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                : "bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{t.quickProfile}</span>
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={() => onSelectProfile("deep")}
            title={t.deepProfileDesc}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer disabled:opacity-50 ${
              activeProfile === "deep"
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                : "bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{t.deepProfile}</span>
          </button>

          {activeProfile === "custom" && (
            <span className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 border border-slate-700/80 text-slate-300">
              {t.customProfile}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
          <span>{t.whitelistBanner}</span>
        </div>
      </div>
    </section>
  );
}
