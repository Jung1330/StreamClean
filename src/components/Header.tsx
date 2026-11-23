import { ShieldCheck, ShieldAlert, Sparkles, History } from "lucide-react";
import type { Language, LifetimeStats } from "../types";
import type { Translations } from "../i18n";
import { formatBytes, formatDate } from "../utils/format";

interface HeaderProps {
  t: Translations;
  lang: Language;
  onToggleLang: (lang: Language) => void;
  isAdmin: boolean;
  onRestartAsAdmin: () => void;
  stats: LifetimeStats;
  appVersion: string;
}

export function Header({
  t,
  lang,
  onToggleLang,
  isAdmin,
  onRestartAsAdmin,
  stats,
  appVersion,
}: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/10 border border-cyan-400/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
          <Sparkles className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-slate-100">
              StreamClean
            </h1>
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-slate-800/90 text-slate-400 border border-slate-700/60">
              v{appVersion}
            </span>
          </div>
          <p className="text-xs text-slate-400">{t.appTagline}</p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Lifetime Stats Pill */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#11151f] border border-slate-800/90 text-xs"
          title={`${t.lastClean}: ${formatDate(stats.lastCleanedAt, lang)}`}
        >
          <History className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-slate-400">{t.lifetimeCleaned}:</span>
          <span className="font-semibold text-emerald-400 tabular-nums">
            {formatBytes(stats.totalCleanedBytes)}
          </span>
        </div>

        {/* Admin status / UAC button */}
        {isAdmin ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.adminActive}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onRestartAsAdmin}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t.restartAsAdmin}</span>
          </button>
        )}

        {/* Language Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-[#11151f] border border-slate-800/90">
          <button
            type="button"
            onClick={() => onToggleLang("tr")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              lang === "tr"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            TR
          </button>
          <button
            type="button"
            onClick={() => onToggleLang("en")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              lang === "en"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
