import { useCallback, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Search, Eye, EyeOff, AlertCircle } from "lucide-react";
import type {
  CategoryId,
  CleanProgressEvent,
  CleanResponse,
  Language,
  LifetimeStats,
  ProfileId,
  RunningAppInfo,
  ScanProgressEvent,
  ScanResponse,
  SystemInfo,
  TargetScanResult,
} from "./types";
import { detectDefaultLanguage, TRANSLATIONS } from "./i18n";
import { Header } from "./components/Header";
import { SummaryCard } from "./components/SummaryCard";
import { RunningAppsBar } from "./components/RunningAppsBar";
import { CategoryCard } from "./components/CategoryCard";
import { ConfirmCleanModal } from "./components/ConfirmCleanModal";
import { CleanReportModal } from "./components/CleanReportModal";

const CATEGORY_ORDER: CategoryId[] = [
  "gpu_shader",
  "game_launchers",
  "streaming_comms",
  "windows_temp",
];

function computeProfileSelection(
  targets: TargetScanResult[],
  profile: "quick" | "deep",
  isAdmin: boolean
): Set<string> {
  const next = new Set<string>();
  for (const target of targets) {
    if (!target.exists) continue;
    if (target.requiresAdmin && !isAdmin) continue;
    if (profile === "quick" && target.inQuickProfile) {
      next.add(target.id);
    } else if (profile === "deep" && target.inDeepProfile) {
      next.add(target.id);
    }
  }
  return next;
}

export function App() {
  const [lang, setLang] = useState<Language>(detectDefaultLanguage);
  const t = TRANSLATIONS[lang];

  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    isAdmin: false,
    appVersion: "1.0.0",
  });
  const [stats, setStats] = useState<LifetimeStats>({
    totalCleanedBytes: 0,
    totalFilesDeleted: 0,
    cleanCount: 0,
    lastCleanedAt: null,
  });
  const [runningApps, setRunningApps] = useState<RunningAppInfo[]>([]);
  const [isRefreshingApps, setIsRefreshingApps] = useState(false);

  const [targets, setTargets] = useState<TargetScanResult[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const [scanProgress, setScanProgress] = useState<ScanProgressEvent | null>(null);
  const [cleanProgress, setCleanProgress] = useState<CleanProgressEvent | null>(null);

  const [activeProfile, setActiveProfile] = useState<ProfileId>("quick");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showMissing, setShowMissing] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cleanReport, setCleanReport] = useState<CleanResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleToggleLang = useCallback((nextLang: Language) => {
    setLang(nextLang);
    try {
      localStorage.setItem("streamclean_lang", nextLang);
    } catch {
      // ignore storage errors
    }
  }, []);

  const refreshRunningApps = useCallback(async () => {
    setIsRefreshingApps(true);
    try {
      const apps = await invoke<RunningAppInfo[]>("get_running_apps");
      setRunningApps(apps);
    } catch {
      // non-fatal
    } finally {
      setIsRefreshingApps(false);
    }
  }, []);

  // Initial load: system info, lifetime stats, running apps, event listeners
  useEffect(() => {
    let unlistenScan: (() => void) | undefined;
    let unlistenClean: (() => void) | undefined;

    (async () => {
      try {
        const [sys, savedStats] = await Promise.all([
          invoke<SystemInfo>("get_system_info"),
          invoke<LifetimeStats>("get_stats"),
        ]);
        setSystemInfo(sys);
        setStats(savedStats);
      } catch (err) {
        setErrorMessage(String(err));
      }

      await refreshRunningApps();

      unlistenScan = await listen<ScanProgressEvent>("scan-progress", (e) => {
        setScanProgress(e.payload);
      });
      unlistenClean = await listen<CleanProgressEvent>("clean-progress", (e) => {
        setCleanProgress(e.payload);
      });
    })();

    return () => {
      unlistenScan?.();
      unlistenClean?.();
    };
  }, [refreshRunningApps]);

  const handleScan = useCallback(async () => {
    setErrorMessage(null);
    setIsScanning(true);
    setScanProgress(null);

    try {
      const [scanRes] = await Promise.all([
        invoke<ScanResponse>("scan_targets"),
        refreshRunningApps(),
      ]);
      setTargets(scanRes.targets);
      setSystemInfo((prev) => ({ ...prev, isAdmin: scanRes.isAdmin }));
      setHasScanned(true);

      const profileToApply = activeProfile === "deep" ? "deep" : "quick";
      setSelectedIds(
        computeProfileSelection(scanRes.targets, profileToApply, scanRes.isAdmin)
      );
      if (activeProfile === "custom") {
        setActiveProfile(profileToApply);
      }
    } catch (err) {
      setErrorMessage(String(err));
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  }, [activeProfile, refreshRunningApps]);

  const handleSelectProfile = useCallback(
    (profile: "quick" | "deep") => {
      setActiveProfile(profile);
      if (hasScanned) {
        setSelectedIds(computeProfileSelection(targets, profile, systemInfo.isAdmin));
      }
    },
    [hasScanned, targets, systemInfo.isAdmin]
  );

  const handleToggleTarget = useCallback((id: string) => {
    setActiveProfile("custom");
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleCategory = useCallback(
    (categoryId: CategoryId) => {
      setActiveProfile("custom");
      const categoryTargets = targets.filter(
        (item) =>
          item.category === categoryId &&
          item.exists &&
          (!item.requiresAdmin || systemInfo.isAdmin)
      );
      setSelectedIds((prev) => {
        const next = new Set(prev);
        const allSelected = categoryTargets.every((item) => next.has(item.id));
        for (const item of categoryTargets) {
          if (allSelected) {
            next.delete(item.id);
          } else {
            next.add(item.id);
          }
        }
        return next;
      });
    },
    [targets, systemInfo.isAdmin]
  );

  const handleInspectFolder = useCallback(async (path: string) => {
    try {
      await invoke("open_folder", { path });
    } catch (err) {
      setErrorMessage(String(err));
    }
  }, []);

  const handleRestartAsAdmin = useCallback(async () => {
    setErrorMessage(null);
    try {
      await invoke("restart_as_admin");
    } catch (err) {
      setErrorMessage(String(err));
    }
  }, []);

  const handleConfirmClean = useCallback(async () => {
    setShowConfirmModal(false);
    setErrorMessage(null);
    setIsCleaning(true);
    setCleanProgress(null);

    try {
      const idsToClean = Array.from(selectedIds);
      const response = await invoke<CleanResponse>("clean_targets", {
        targetIds: idsToClean,
      });
      setStats(response.updatedStats);
      setCleanReport(response);

      // Re-scan automatically after cleaning so sizes reflect current disk state
      const scanRes = await invoke<ScanResponse>("scan_targets");
      setTargets(scanRes.targets);
      await refreshRunningApps();
    } catch (err) {
      setErrorMessage(String(err));
    } finally {
      setIsCleaning(false);
      setCleanProgress(null);
    }
  }, [selectedIds, refreshRunningApps]);

  const runningAppIds = useMemo(
    () => new Set(runningApps.map((a) => a.id)),
    [runningApps]
  );

  const {
    totalFoundBytes,
    totalFoundFiles,
    selectedBytes,
    selectedFiles,
    selectedCount,
    includesShaders,
    includesRecycleBin,
  } = useMemo(() => {
    let foundB = 0;
    let foundF = 0;
    let selB = 0;
    let selF = 0;
    let selC = 0;
    let hasShaders = false;
    let hasRecycle = false;

    for (const item of targets) {
      foundB += item.sizeBytes;
      foundF += item.fileCount;
      if (selectedIds.has(item.id) && item.exists && (!item.requiresAdmin || systemInfo.isAdmin)) {
        selB += item.sizeBytes;
        selF += item.fileCount;
        selC += 1;
        if (item.category === "gpu_shader") hasShaders = true;
        if (item.kind === "recycle_bin") hasRecycle = true;
      }
    }

    return {
      totalFoundBytes: foundB,
      totalFoundFiles: foundF,
      selectedBytes: selB,
      selectedFiles: selF,
      selectedCount: selC,
      includesShaders: hasShaders,
      includesRecycleBin: hasRecycle,
    };
  }, [targets, selectedIds, systemInfo.isAdmin]);

  const missingCount = useMemo(
    () => targets.filter((t) => !t.exists && !t.requiresAdmin && t.kind !== "recycle_bin").length,
    [targets]
  );

  return (
    <div className="min-h-screen bg-[#0b0d12] text-slate-100">
      <div className="max-w-5xl mx-auto px-5 py-6 space-y-5">
        <Header
          t={t}
          lang={lang}
          onToggleLang={handleToggleLang}
          isAdmin={systemInfo.isAdmin}
          onRestartAsAdmin={handleRestartAsAdmin}
          stats={stats}
          appVersion={systemInfo.appVersion}
        />

        <SummaryCard
          t={t}
          lang={lang}
          hasScanned={hasScanned}
          isScanning={isScanning}
          isCleaning={isCleaning}
          totalFoundBytes={totalFoundBytes}
          totalFoundFiles={totalFoundFiles}
          selectedBytes={selectedBytes}
          selectedFiles={selectedFiles}
          selectedCount={selectedCount}
          activeProfile={activeProfile}
          scanProgress={scanProgress}
          cleanProgress={cleanProgress}
          onScan={handleScan}
          onRequestClean={() => setShowConfirmModal(true)}
          onSelectProfile={handleSelectProfile}
        />

        <RunningAppsBar
          t={t}
          runningApps={runningApps}
          onRefresh={refreshRunningApps}
          isRefreshing={isRefreshingApps}
        />

        {errorMessage && (
          <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>{t.errorTitle}:</strong> {errorMessage}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-300 hover:text-rose-100 underline cursor-pointer shrink-0"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Content: Empty Ready State OR Scanned Categories */}
        {!hasScanned && !isScanning ? (
          <div className="rounded-2xl bg-[#11151f] border border-slate-800/90 p-10 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
              <Search className="w-7 h-7 text-cyan-400" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h2 className="text-lg font-semibold text-slate-100">{t.readyTitle}</h2>
              <p className="text-sm text-slate-400 leading-relaxed">{t.readySubtitle}</p>
            </div>
            <button
              type="button"
              onClick={handleScan}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-sm font-semibold shadow-lg shadow-cyan-500/15 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{t.scan}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {CATEGORY_ORDER.map((catId) => (
              <CategoryCard
                key={catId}
                t={t}
                lang={lang}
                categoryId={catId}
                targets={targets.filter((item) => item.category === catId)}
                selectedIds={selectedIds}
                runningAppIds={runningAppIds}
                isAdmin={systemInfo.isAdmin}
                isBusy={isScanning || isCleaning}
                showMissing={showMissing}
                onToggleTarget={handleToggleTarget}
                onToggleCategory={handleToggleCategory}
                onInspectFolder={handleInspectFolder}
                onRestartAsAdmin={handleRestartAsAdmin}
              />
            ))}

            {hasScanned && missingCount > 0 && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowMissing((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showMissing ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {t.showMissingToggle} ({missingCount})
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showConfirmModal && (
        <ConfirmCleanModal
          t={t}
          lang={lang}
          selectedBytes={selectedBytes}
          selectedFiles={selectedFiles}
          selectedCount={selectedCount}
          includesShaders={includesShaders}
          includesRecycleBin={includesRecycleBin}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmClean}
        />
      )}

      {cleanReport && (
        <CleanReportModal
          t={t}
          lang={lang}
          report={cleanReport}
          onClose={() => setCleanReport(null)}
        />
      )}
    </div>
  );
}

export default App;
