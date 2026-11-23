import type { CategoryId, Language } from "./types";

export interface TargetCopy {
  name: string;
  description: string;
}

export interface CategoryCopy {
  title: string;
  subtitle: string;
  warning?: string;
}

export interface Translations {
  appTagline: string;
  adminActive: string;
  standardMode: string;
  restartAsAdmin: string;
  lifetimeCleaned: string;
  lastClean: string;
  scan: string;
  scanning: string;
  rescan: string;
  cleanSelected: string;
  cleaning: string;
  totalFound: string;
  selectedToClean: string;
  filesLabel: string;
  targetsLabel: string;
  profilesLabel: string;
  quickProfile: string;
  quickProfileDesc: string;
  deepProfile: string;
  deepProfileDesc: string;
  customProfile: string;
  runningAppChip: (appName: string) => string;
  refreshApps: string;
  inspectFolder: string;
  adminRequired: string;
  unlockWithAdmin: string;
  optionalBadge: string;
  notFoundBadge: string;
  emptyBadge: string;
  appRunningBadge: string;
  showMissingToggle: string;
  whitelistBanner: string;
  readyTitle: string;
  readySubtitle: string;
  scanProgressLabel: (done: number, total: number) => string;
  cleanProgressLabel: (done: number, total: number, cleaned: string) => string;
  confirmTitle: string;
  confirmSubtitle: string;
  confirmShaderNote: string;
  confirmRecycleNote: string;
  confirmCancel: string;
  confirmProceed: string;
  reportTitle: string;
  reportSummary: (cleaned: string, skipped: number) => string;
  reportSummaryNoSkipped: (cleaned: string) => string;
  reportCleanedSize: string;
  reportDeletedFiles: string;
  reportSkippedFiles: string;
  reportDuration: string;
  reportBreakdown: string;
  reportSkippedAdmin: string;
  reportClose: string;
  errorTitle: string;
  categories: Record<CategoryId, CategoryCopy>;
  targets: Record<string, TargetCopy>;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  tr: {
    appTagline: "Oyuncu & Yayıncı Disk Temizleyici",
    adminActive: "Yönetici İzni Aktif",
    standardMode: "Standart Mod",
    restartAsAdmin: "Yönetici Olarak Yeniden Başlat",
    lifetimeCleaned: "Bugüne kadar toplam",
    lastClean: "Son temizlik",
    scan: "Tara",
    scanning: "Taranıyor...",
    rescan: "Yeniden Tara",
    cleanSelected: "Seçilenleri Temizle",
    cleaning: "Temizleniyor...",
    totalFound: "Toplam Bulunan",
    selectedToClean: "Temizlenecek Seçili Boyut",
    filesLabel: "dosya",
    targetsLabel: "hedef",
    profilesLabel: "Hazır Profiller",
    quickProfile: "Hızlı Temizlik",
    quickProfileDesc: "Loglar, Temp ve Discord/Launcher önbelleği (GPU Shader'lara dokunmaz)",
    deepProfile: "Derin Oyuncu Temizliği",
    deepProfileDesc: "Hepsi + GPU Shader Cache ve eski sürücü kurulum kalıntıları",
    customProfile: "Özel Seçim",
    runningAppChip: (app) => `${app} açık — tam temizlik için kapatabilirsin`,
    refreshApps: "Açık uygulamaları yenile",
    inspectFolder: "Klasörü Explorer'da aç",
    adminRequired: "Yönetici izni gerekir",
    unlockWithAdmin: "Yönetici İzniyle Aç",
    optionalBadge: "Opsiyonel",
    notFoundBadge: "Bulunamadı",
    emptyBadge: "Temiz",
    appRunningBadge: "Açık",
    showMissingToggle: "Kurulu olmayan hedefleri göster",
    whitelistBanner:
      "Sadece güvenli whitelist klasörleri taranır — oyun save, config, şifre veya kayıt defterine asla dokunulmaz.",
    readyTitle: "Taramaya Hazır",
    readySubtitle:
      "StreamClean onayınız olmadan hiçbir dosyayı silmez. Önce paralel tarama yaparak tüm önbellek boyutlarını güvenle inceleyin.",
    scanProgressLabel: (done, total) => `Paralel tarama: ${done} / ${total} hedef`,
    cleanProgressLabel: (done, total, cleaned) =>
      `Temizleniyor: ${done} / ${total} hedef (${cleaned} temizlendi)`,
    confirmTitle: "Temizliği Onayla",
    confirmSubtitle:
      "Seçili whitelist önbellek ve geçici dosyaları kalıcı olarak silinecek. Kullanımda olan kilitli dosyalar güvenle atlanır.",
    confirmShaderNote:
      "GPU Shader Cache seçili: Oyunlar ilk açılışta 1-2 dk shader yeniden derleyebilir.",
    confirmRecycleNote: "Geri Dönüşüm Kutusu tamamen boşaltılacak.",
    confirmCancel: "Vazgeç",
    confirmProceed: "Evet, Temizle",
    reportTitle: "Temizlik Tamamlandı",
    reportSummary: (cleaned, skipped) =>
      `${cleaned} temizlendi, ${skipped} dosya kullanımda olduğu için atlandı.`,
    reportSummaryNoSkipped: (cleaned) => `${cleaned} başarıyla temizlendi.`,
    reportCleanedSize: "Temizlenen Boyut",
    reportDeletedFiles: "Silinen Dosya",
    reportSkippedFiles: "Atlanan (Kilitli)",
    reportDuration: "Süre",
    reportBreakdown: "Hedef Detayları",
    reportSkippedAdmin: "Yönetici izni gerekli",
    reportClose: "Kapat",
    errorTitle: "İşlem Hatası",
    categories: {
      gpu_shader: {
        title: "GPU & Shader Cache",
        subtitle: "NVIDIA, AMD ve DirectX gölgelendirici önbellekleri",
        warning:
          "Oyunlar ilk açılışta 1-2 dk shader yeniden derleyebilir; stutter/FPS drop çözmek için faydalıdır.",
      },
      game_launchers: {
        title: "Oyun Launcher & Kalıntılar",
        subtitle: "Yalnızca önbellek, log ve çökme raporları (ayar/save dosyalarına dokunulmaz)",
      },
      streaming_comms: {
        title: "Yayıncı & İletişim Uygulamaları",
        subtitle: "Discord, OBS Studio ve Spotify önbellek ve log dosyaları",
      },
      windows_temp: {
        title: "Windows Geçici Dosyaları",
        subtitle: "Sistem ve kullanıcı geçici dosyaları, çökme dökümleri ve Geri Dönüşüm Kutusu",
      },
    },
    targets: {
      nvidia_dxcache: {
        name: "NVIDIA DirectX Shader Cache",
        description: "DirectX 11/12 derlenmiş NVIDIA gölgelendirici önbelleği",
      },
      nvidia_glcache: {
        name: "NVIDIA OpenGL Cache",
        description: "OpenGL ve Vulkan uygulamaları için NVIDIA önbelleği",
      },
      nvidia_computecache: {
        name: "NVIDIA Compute Cache",
        description: "CUDA / hesaplama gölgelendirici önbelleği",
      },
      nvidia_downloader: {
        name: "NVIDIA Eski Sürücü Kalıntıları",
        description: "GeForce Experience / NVIDIA App eski kurulum paketleri",
      },
      amd_dxcache: {
        name: "AMD DirectX Shader Cache",
        description: "AMD Radeon DirectX gölgelendirici önbelleği",
      },
      amd_glcache: {
        name: "AMD OpenGL Cache",
        description: "AMD Radeon OpenGL gölgelendirici önbelleği",
      },
      amd_vkcache: {
        name: "AMD Vulkan Cache",
        description: "AMD Radeon Vulkan pipeline önbelleği",
      },
      directx_shader_cache: {
        name: "Windows DirectX Shader Cache",
        description: "Sistem geneli DirectX D3DSCache dosyaları",
      },
      riot_cache_logs: {
        name: "Riot Client / LoL / Valorant",
        description: "Yalnızca önbellek, log ve çökme raporları (ayar/replay korunur)",
      },
      steam_cache: {
        name: "Steam HTTP Cache, Logs & Dumps",
        description: "Steam tarayıcı önbelleği, günlükler ve çökme dökümleri",
      },
      epic_cache: {
        name: "Epic Games Launcher",
        description: "Webcache, log ve çökme raporları",
      },
      battlenet_cache: {
        name: "Battle.net Cache & Logs",
        description: "Blizzard tarayıcı önbelleği ve günlük dosyaları",
      },
      ubisoft_cache: {
        name: "Ubisoft Connect Cache & Logs",
        description: "Ubisoft önbellek, log ve çökme dosyaları",
      },
      ea_cache: {
        name: "EA App Cache & Logs",
        description: "EA Desktop önbellek, log ve çökme raporları",
      },
      discord_cache: {
        name: "Discord (Stable / PTB / Canary)",
        description: "Cache, Code Cache, GPUCache ve Crashpad dosyaları",
      },
      obs_logs: {
        name: "OBS Studio Logs & Crashes",
        description: "Eski yayın kayıt logları ve çökme raporları (sahneler korunur)",
      },
      spotify_cache: {
        name: "Spotify Önbelleği",
        description: "Müzik akışı önbelleği — temizlenince parçalar yeniden indirilir",
      },
      user_temp: {
        name: "Kullanıcı Temp (%TEMP%)",
        description: "Uygulamaların bıraktığı geçici dosyalar",
      },
      crash_dumps: {
        name: "Windows CrashDumps",
        description: "Uygulama çökme bellek dökümleri (.dmp)",
      },
      system_temp: {
        name: "Sistem Temp (C:\\Windows\\Temp)",
        description: "Windows sistem geçici dosyaları (Yönetici izni gerekir)",
      },
      windows_update_cache: {
        name: "Windows Update İndirme Önbelleği",
        description: "Eski Windows güncelleme kurulum dosyaları (Yönetici izni gerekir)",
      },
      recycle_bin: {
        name: "Geri Dönüşüm Kutusu",
        description: "Windows Geri Dönüşüm Kutusundaki tüm öğeleri kalıcı olarak boşaltır",
      },
    },
  },
  en: {
    appTagline: "Gamer & Streamer Disk Cleaner",
    adminActive: "Administrator Mode",
    standardMode: "Standard Mode",
    restartAsAdmin: "Restart as Administrator",
    lifetimeCleaned: "Lifetime total cleaned",
    lastClean: "Last cleaned",
    scan: "Scan",
    scanning: "Scanning...",
    rescan: "Rescan",
    cleanSelected: "Clean Selected",
    cleaning: "Cleaning...",
    totalFound: "Total Found",
    selectedToClean: "Selected to Clean",
    filesLabel: "files",
    targetsLabel: "targets",
    profilesLabel: "Preset Profiles",
    quickProfile: "Quick Clean",
    quickProfileDesc: "Logs, Temp, and Discord/Launcher caches (leaves GPU Shaders untouched)",
    deepProfile: "Deep Gamer Clean",
    deepProfileDesc: "Everything + GPU Shader Cache and old driver installer leftovers",
    customProfile: "Custom",
    runningAppChip: (app) => `${app} is running — close it for a complete clean`,
    refreshApps: "Refresh running apps",
    inspectFolder: "Open folder in Explorer",
    adminRequired: "Requires Administrator",
    unlockWithAdmin: "Unlock with Admin",
    optionalBadge: "Optional",
    notFoundBadge: "Not found",
    emptyBadge: "Clean",
    appRunningBadge: "Running",
    showMissingToggle: "Show unavailable targets",
    whitelistBanner:
      "Strict whitelist only — never touches game saves, configs, browser passwords, or the Windows Registry.",
    readyTitle: "Ready to Scan",
    readySubtitle:
      "StreamClean never deletes anything without confirmation. Run a fast parallel scan first to inspect exact folder paths and sizes.",
    scanProgressLabel: (done, total) => `Parallel scan: ${done} / ${total} targets`,
    cleanProgressLabel: (done, total, cleaned) =>
      `Cleaning: ${done} / ${total} targets (${cleaned} freed)`,
    confirmTitle: "Confirm Cleaning",
    confirmSubtitle:
      "Selected whitelisted cache and temporary files will be permanently deleted. Locked files in use will be skipped safely.",
    confirmShaderNote:
      "GPU Shader Cache selected: Games may recompile shaders for 1–2 min on next launch.",
    confirmRecycleNote: "Windows Recycle Bin will be permanently emptied.",
    confirmCancel: "Cancel",
    confirmProceed: "Yes, Clean Now",
    reportTitle: "Cleaning Complete",
    reportSummary: (cleaned, skipped) =>
      `${cleaned} cleaned, ${skipped} files skipped because they were in use.`,
    reportSummaryNoSkipped: (cleaned) => `${cleaned} cleaned successfully.`,
    reportCleanedSize: "Space Freed",
    reportDeletedFiles: "Files Deleted",
    reportSkippedFiles: "Skipped (Locked)",
    reportDuration: "Duration",
    reportBreakdown: "Target Breakdown",
    reportSkippedAdmin: "Administrator required",
    reportClose: "Done",
    errorTitle: "Operation Error",
    categories: {
      gpu_shader: {
        title: "GPU & Shader Cache",
        subtitle: "NVIDIA, AMD, and DirectX compiled shader caches",
        warning:
          "Games may recompile shaders for 1–2 min on first launch; helpful for fixing stutter and FPS drops.",
      },
      game_launchers: {
        title: "Game Launchers & Leftovers",
        subtitle: "Cache, logs, and crash reports only (saves and configs are untouched)",
      },
      streaming_comms: {
        title: "Streaming & Communication Apps",
        subtitle: "Discord, OBS Studio, and Spotify cache and log files",
      },
      windows_temp: {
        title: "Windows Temporary Files",
        subtitle: "User & system temp files, crash dumps, and Recycle Bin",
      },
    },
    targets: {
      nvidia_dxcache: {
        name: "NVIDIA DirectX Shader Cache",
        description: "Compiled DirectX 11/12 shaders for NVIDIA GPUs",
      },
      nvidia_glcache: {
        name: "NVIDIA OpenGL Cache",
        description: "NVIDIA OpenGL and Vulkan shader cache",
      },
      nvidia_computecache: {
        name: "NVIDIA Compute Cache",
        description: "CUDA and compute shader cache files",
      },
      nvidia_downloader: {
        name: "NVIDIA Driver Installer Leftovers",
        description: "Old GeForce Experience / NVIDIA App driver packages",
      },
      amd_dxcache: {
        name: "AMD DirectX Shader Cache",
        description: "AMD Radeon DirectX shader cache",
      },
      amd_glcache: {
        name: "AMD OpenGL Cache",
        description: "AMD Radeon OpenGL shader cache",
      },
      amd_vkcache: {
        name: "AMD Vulkan Cache",
        description: "AMD Radeon Vulkan pipeline cache",
      },
      directx_shader_cache: {
        name: "Windows DirectX Shader Cache",
        description: "System-wide DirectX D3DSCache directory",
      },
      riot_cache_logs: {
        name: "Riot Client / LoL / Valorant",
        description: "Cache, logs, and crash reports only (settings & replays preserved)",
      },
      steam_cache: {
        name: "Steam HTTP Cache, Logs & Dumps",
        description: "Steam web browser cache, log files, and crash dumps",
      },
      epic_cache: {
        name: "Epic Games Launcher",
        description: "Webcache, logs, and crash reports",
      },
      battlenet_cache: {
        name: "Battle.net Cache & Logs",
        description: "Blizzard browser cache and log files",
      },
      ubisoft_cache: {
        name: "Ubisoft Connect Cache & Logs",
        description: "Ubisoft launcher cache, logs, and crash dumps",
      },
      ea_cache: {
        name: "EA App Cache & Logs",
        description: "EA Desktop cache, logs, and crash reports",
      },
      discord_cache: {
        name: "Discord (Stable / PTB / Canary)",
        description: "Cache, Code Cache, GPUCache, and Crashpad files",
      },
      obs_logs: {
        name: "OBS Studio Logs & Crashes",
        description: "Old session logs and crash reports (scenes & profiles preserved)",
      },
      spotify_cache: {
        name: "Spotify Audio Cache",
        description: "Streaming audio cache — tracks will re-cache as you listen",
      },
      user_temp: {
        name: "User Temp (%TEMP%)",
        description: "Temporary files left behind by user applications",
      },
      crash_dumps: {
        name: "Windows CrashDumps",
        description: "Application crash memory dumps (.dmp)",
      },
      system_temp: {
        name: "System Temp (C:\\Windows\\Temp)",
        description: "Windows system temporary folder (Administrator required)",
      },
      windows_update_cache: {
        name: "Windows Update Download Cache",
        description: "Cached Windows Update installer packages (Administrator required)",
      },
      recycle_bin: {
        name: "Recycle Bin",
        description: "Permanently empties all items in the Windows Recycle Bin",
      },
    },
  },
};

export function detectDefaultLanguage(): Language {
  try {
    const saved = localStorage.getItem("streamclean_lang");
    if (saved === "tr" || saved === "en") return saved;
  } catch {
    // ignore storage errors
  }
  const nav = navigator.language?.toLowerCase() ?? "tr";
  return nav.startsWith("tr") ? "tr" : "en";
}
