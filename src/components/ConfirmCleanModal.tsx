import { AlertTriangle, Trash2, X } from "lucide-react";
import type { Language } from "../types";
import type { Translations } from "../i18n";
import { formatBytes, formatNumber } from "../utils/format";

interface ConfirmCleanModalProps {
  t: Translations;
  lang: Language;
  selectedBytes: number;
  selectedFiles: number;
  selectedCount: number;
  includesShaders: boolean;
  includesRecycleBin: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmCleanModal({
  t,
  lang,
  selectedBytes,
  selectedFiles,
  selectedCount,
  includesShaders,
  includesRecycleBin,
  onCancel,
  onConfirm,
}: ConfirmCleanModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#11151f] border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-cyan-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">{t.confirmTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">{t.confirmSubtitle}</p>

          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">{t.selectedToClean}</p>
              <p className="text-2xl font-bold text-cyan-400 tabular-nums mt-0.5">
                {formatBytes(selectedBytes)}
              </p>
            </div>
            <div className="text-right text-xs text-slate-400 tabular-nums space-y-0.5">
              <p>
                {selectedCount} {t.targetsLabel}
              </p>
              <p>
                {formatNumber(selectedFiles, lang)} {t.filesLabel}
              </p>
            </div>
          </div>

          {(includesShaders || includesRecycleBin) && (
            <div className="space-y-2">
              {includesShaders && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t.confirmShaderNote}</span>
                </div>
              )}
              {includesRecycleBin && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t.confirmRecycleNote}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-900/50 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors cursor-pointer"
          >
            {t.confirmCancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-sm font-semibold transition-all cursor-pointer"
          >
            {t.confirmProceed}
          </button>
        </div>
      </div>
    </div>
  );
}
