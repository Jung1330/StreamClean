import {
  Cpu,
  Gamepad2,
  Headphones,
  HardDrive,
  FolderSearch,
  Lock,
  AlertTriangle,
  Check,
  ShieldAlert,
} from "lucide-react";
import type { CategoryId, Language, TargetScanResult } from "../types";
import type { Translations } from "../i18n";
import { formatBytes, formatNumber } from "../utils/format";

interface CategoryCardProps {
  t: Translations;
  lang: Language;
  categoryId: CategoryId;
  targets: TargetScanResult[];
  selectedIds: Set<string>;
  runningAppIds: Set<string>;
  isAdmin: boolean;
  isBusy: boolean;
  showMissing: boolean;
  onToggleTarget: (id: string) => void;
  onToggleCategory: (categoryId: CategoryId) => void;
  onInspectFolder: (path: string) => void;
  onRestartAsAdmin: () => void;
}

const CATEGORY_ICON: Record<CategoryId, typeof Cpu> = {
  gpu_shader: Cpu,
  game_launchers: Gamepad2,
  streaming_comms: Headphones,
  windows_temp: HardDrive,
};

export function CategoryCard({
  t,
  lang,
  categoryId,
  targets,
  selectedIds,
  runningAppIds,
  isAdmin,
  isBusy,
  showMissing,
  onToggleTarget,
  onToggleCategory,
  onInspectFolder,
  onRestartAsAdmin,
}: CategoryCardProps) {
  const Icon = CATEGORY_ICON[categoryId];
  const copy = t.categories[categoryId];

  const visibleTargets = showMissing
    ? targets
    : targets.filter((item) => item.exists || item.requiresAdmin || item.kind === "recycle_bin");

  if (visibleTargets.length === 0) return null;

  const selectableTargets = visibleTargets.filter(
    (item) => item.exists && (!item.requiresAdmin || isAdmin)
  );
  const allSelected =
    selectableTargets.length > 0 &&
    selectableTargets.every((item) => selectedIds.has(item.id));
  const someSelected =
    selectableTargets.some((item) => selectedIds.has(item.id)) && !allSelected;

  const categoryBytes = visibleTargets.reduce((sum, item) => sum + item.sizeBytes, 0);

  return (
    <section className="rounded-2xl bg-[#11151f] border border-slate-800/90 overflow-hidden shadow-lg shadow-black/15">
      {/* Category Header */}
      <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-slate-800/70 bg-slate-900/35">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            disabled={isBusy || selectableTargets.length === 0}
            onClick={() => onToggleCategory(categoryId)}
            aria-label={copy.title}
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              allSelected
                ? "bg-cyan-500 border-cyan-400 text-slate-950"
                : someSelected
                  ? "bg-cyan-500/25 border-cyan-400/70 text-cyan-300"
                  : "bg-slate-900 border-slate-700 hover:border-slate-500"
            }`}
          >
            {allSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            {someSelected && <span className="w-2 h-0.5 rounded-full bg-cyan-300" />}
          </button>

          <div className="w-8 h-8 rounded-lg bg-slate-800/90 border border-slate-700/70 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-100 truncate">
              {copy.title}
            </h2>
            <p className="text-xs text-slate-400 truncate">{copy.subtitle}</p>
          </div>
        </div>

        <span className="text-sm font-semibold text-slate-200 tabular-nums shrink-0">
          {formatBytes(categoryBytes)}
        </span>
      </div>

      {/* Category Warning Badge (GPU & Shader Cache) */}
      {copy.warning && (
        <div className="mx-5 mt-3.5 px-3.5 py-2 rounded-xl bg-amber-500/[0.08] border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-200/90">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{copy.warning}</span>
        </div>
      )}

      {/* Target Rows */}
      <div className="divide-y divide-slate-800/60 mt-1">
        {visibleTargets.map((target) => {
          const targetCopy = t.targets[target.id] ?? {
            name: target.id,
            description: "",
          };
          const lockedByAdmin = target.requiresAdmin && !isAdmin;
          const isDisabled = isBusy || lockedByAdmin || !target.exists;
          const isChecked = selectedIds.has(target.id) && !lockedByAdmin && target.exists;
          const isAppRunning = target.relatedApps.some((a) => runningAppIds.has(a));

          return (
            <div
              key={target.id}
              className={`px-5 py-3 flex items-center justify-between gap-4 transition-colors ${
                !target.exists
                  ? "opacity-45"
                  : lockedByAdmin
                    ? "bg-slate-900/25"
                    : "hover:bg-slate-800/25"
              }`}
            >
              {/* Left: Checkbox + Info */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {lockedByAdmin ? (
                  <div
                    className="mt-0.5 w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0"
                    title={t.adminRequired}
                  >
                    <Lock className="w-3 h-3 text-amber-400" />
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => onToggleTarget(target.id)}
                    aria-label={targetCopy.name}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      isChecked
                        ? "bg-cyan-500 border-cyan-400 text-slate-950"
                        : "bg-slate-900 border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-100">
                      {targetCopy.name}
                    </span>

                    {target.optional && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/70">
                        {t.optionalBadge}
                      </span>
                    )}

                    {isAppRunning && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25">
                        {t.appRunningBadge}
                      </span>
                    )}

                    {!target.exists && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-500">
                        {t.notFoundBadge}
                      </span>
                    )}

                    {lockedByAdmin && (
                      <button
                        type="button"
                        onClick={onRestartAsAdmin}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                      >
                        <ShieldAlert className="w-3 h-3" />
                        <span>{t.unlockWithAdmin}</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {targetCopy.description}
                  </p>

                  <p
                    className="text-[11px] font-mono text-slate-500 truncate mt-1"
                    title={target.displayPath}
                  >
                    {target.displayPath}
                  </p>
                </div>
              </div>

              {/* Right: Size + File count + Inspect Folder button */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div
                    className={`text-sm font-semibold tabular-nums ${
                      target.sizeBytes > 0 ? "text-slate-100" : "text-slate-500"
                    }`}
                  >
                    {target.sizeBytes > 0 ? formatBytes(target.sizeBytes) : t.emptyBadge}
                  </div>
                  {target.exists && (
                    <div className="text-[11px] text-slate-500 tabular-nums">
                      {formatNumber(target.fileCount, lang)} {t.filesLabel}
                    </div>
                  )}
                </div>

                {target.kind === "directory" && target.primaryExistingPath ? (
                  <button
                    type="button"
                    onClick={() => onInspectFolder(target.primaryExistingPath!)}
                    title={t.inspectFolder}
                    className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <FolderSearch className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="w-8" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
