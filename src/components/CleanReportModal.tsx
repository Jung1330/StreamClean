import { CheckCircle2, Lock, X } from "lucide-react";
import type { CleanResponse, Language } from "../types";
import type { Translations } from "../i18n";
import { formatBytes, formatDuration, formatNumber } from "../utils/format";

interface CleanReportModalProps {
  t: Translations;
  lang: Language;
  report: CleanResponse;
  onClose: () => void;
}

export function CleanReportModal({
  t,
  lang,
  report,
  onClose,
}: CleanReportModalProps) {
  const cleanedStr = formatBytes(report.totalCleanedBytes);
  const summaryLine =
    report.totalSkippedFiles > 0
      ? t.reportSummary(cleanedStr, report.totalSkippedFiles)
      : t.reportSummaryNoSkipped(cleanedStr);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-[#11151f] border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">{t.reportTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <p className="text-sm text-slate-200 font-medium">{summaryLine}</p>

          {/* 4 Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
              <p className="text-[11px] text-slate-400">{t.reportCleanedSize}</p>
              <p className="text-lg font-bold text-emerald-400 tabular-nums mt-0.5">
                {cleanedStr}
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
              <p className="text-[11px] text-slate-400">{t.reportDeletedFiles}</p>
              <p className="text-lg font-bold text-slate-100 tabular-nums mt-0.5">
                {formatNumber(report.totalDeletedFiles, lang)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
              <p className="text-[11px] text-slate-400">{t.reportSkippedFiles}</p>
              <p className="text-lg font-bold text-amber-300 tabular-nums mt-0.5">
                {formatNumber(report.totalSkippedFiles, lang)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
              <p className="text-[11px] text-slate-400">{t.reportDuration}</p>
              <p className="text-lg font-bold text-cyan-300 tabular-nums mt-0.5">
                {formatDuration(report.durationMs)}
              </p>
            </div>
          </div>

          {/* Per-target breakdown */}
          {report.results.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                {t.reportBreakdown}
              </p>
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 divide-y divide-slate-800/70 max-h-52 overflow-y-auto">
                {report.results.map((item) => {
                  const name = t.targets[item.id]?.name ?? item.id;
                  return (
                    <div
                      key={item.id}
                      className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-slate-200 font-medium truncate">{name}</span>
                      {item.skippedAdmin ? (
                        <span className="inline-flex items-center gap-1 text-amber-300 shrink-0">
                          <Lock className="w-3 h-3" />
                          {t.reportSkippedAdmin}
                        </span>
                      ) : (
                        <div className="flex items-center gap-3 shrink-0 tabular-nums">
                          <span className="text-emerald-400 font-semibold">
                            {formatBytes(item.cleanedBytes)}
                          </span>
                          <span className="text-slate-500">
                            {formatNumber(item.deletedFiles, lang)} {t.filesLabel}
                          </span>
                          {item.skippedFiles > 0 && (
                            <span className="text-amber-400/90">
                              ({item.skippedFiles} {t.reportSkippedFiles.toLowerCase()})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {t.lifetimeCleaned}:{" "}
            <strong className="text-emerald-400 tabular-nums">
              {formatBytes(report.updatedStats.totalCleanedBytes)}
            </strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold transition-colors cursor-pointer"
          >
            {t.reportClose}
          </button>
        </div>
      </div>
    </div>
  );
}
