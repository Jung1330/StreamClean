use crate::models::{CategoryId, CleanTargetDef, TargetKind};
use std::fs;
use std::path::{Path, PathBuf};

fn local_app_data() -> Option<PathBuf> {
    std::env::var_os("LOCALAPPDATA")
        .map(PathBuf::from)
        .or_else(dirs::data_local_dir)
}

fn roaming_app_data() -> Option<PathBuf> {
    std::env::var_os("APPDATA")
        .map(PathBuf::from)
        .or_else(dirs::config_dir)
}

fn program_data() -> PathBuf {
    std::env::var_os("PROGRAMDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from(r"C:\ProgramData"))
}

fn windows_dir() -> PathBuf {
    std::env::var_os("WINDIR")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from(r"C:\Windows"))
}

/// Finds subdirectories inside `parent` whose lowercase name starts with `prefix` (e.g. `webcache`).
fn find_prefixed_subdirs(parent: &Path, prefix: &str) -> Vec<PathBuf> {
    let mut matches = Vec::new();
    if let Ok(entries) = fs::read_dir(parent) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                    if name.to_ascii_lowercase().starts_with(prefix) {
                        matches.push(path);
                    }
                }
            }
        }
    }
    matches
}

/// Builds the strictly whitelisted list of cleaning targets.
/// StreamClean ONLY ever scans or cleans paths returned by this function.
pub fn build_targets() -> Vec<CleanTargetDef> {
    let local = local_app_data();
    let roaming = roaming_app_data();
    let prog_data = program_data();
    let win_dir = windows_dir();

    let mut targets = Vec::new();

    // =========================================================================
    // 1. GPU & Shader Cache
    // =========================================================================
    if let Some(ref l) = local {
        let p = l.join("NVIDIA").join("DXCache");
        targets.push(CleanTargetDef {
            id: "nvidia_dxcache".into(),
            category: CategoryId::GpuShader,
            kind: TargetKind::Directory,
            display_path: p.to_string_lossy().into_owned(),
            paths: vec![p],
            requires_admin: false,
            optional: false,
            in_quick_profile: false,
            in_deep_profile: true,
            related_apps: vec![],
        });

        let p = l.join("NVIDIA").join("GLCache");
        targets.push(CleanTargetDef {
            id: "nvidia_glcache".into(),
            category: CategoryId::GpuShader,
            kind: TargetKind::Directory,
            display_path: p.to_string_lossy().into_owned(),
            paths: vec![p],
            requires_admin: false,
            optional: false,
            in_quick_profile: false,
            in_deep_profile: true,
            related_apps: vec![],
        });
    }

    if let Some(ref r) = roaming {
        let p = r.join("NVIDIA").join("ComputeCache");
        targets.push(CleanTargetDef {
            id: "nvidia_computecache".into(),
            category: CategoryId::GpuShader,
            kind: TargetKind::Directory,
            display_path: p.to_string_lossy().into_owned(),
            paths: vec![p],
            requires_admin: false,
            optional: false,
            in_quick_profile: false,
            in_deep_profile: true,
            related_apps: vec![],
        });
    }

    {
        let p = prog_data.join("NVIDIA Corporation").join("Downloader");
        targets.push(CleanTargetDef {
            id: "nvidia_downloader".into(),
            category: CategoryId::GpuShader,
            kind: TargetKind::Directory,
            display_path: p.to_string_lossy().into_owned(),
            paths: vec![p],
            requires_admin: false,
            optional: false,
            in_quick_profile: false,
            in_deep_profile: true,
            related_apps: vec![],
        });
    }

    if let Some(ref l) = local {
        let p = l.join("AMD").join("DxCache");
        targets.push(CleanTargetDef {
            id: "amd_dxcache".into(),
            category: CategoryId::GpuShader,
            kind: TargetKind::Directory,
            display_path: p.to_string_lossy().into_owned(),
            paths: vec![p],
            requires_admin: false,
            optional: false,
            in_quick_profile: false,
            in_deep_profile: true,
            related_apps: vec![],
        });

        let p = l.join("AMD").join("GLCache");
        targets.push(CleanTargetDef {
            id: "amd_glcache".into(),
            category: CategoryId::GpuShader,
            kind: TargetKind::Directory,
            display_path: p.to_string_lossy().into_owned(),
            paths: vec![p],
            requires_admin: false,
            optional: false,
            in_quick_profile: false,
            in_deep_profile: true,
            related_apps: vec![],
        });

        let p = l.join("AMD").join("VkCache");
        targets.push(CleanTargetDef {
            id: "amd_vkcache".into(),
            category: CategoryId::GpuShader,
            kind: TargetKind::Directory,
            display_path: p.to_string_lossy().into_owned(),
            paths: vec![p],
            requires_admin: false,
            optional: false,
            in_quick_profile: false,
            in_deep_profile: true,
            related_apps: vec![],
        });

        let p = l.join("D3DSCache");
        targets.push(CleanTargetDef {
            id: "directx_shader_cache".into(),
            category: CategoryId::GpuShader,
            kind: TargetKind::Directory,
            display_path: p.to_string_lossy().into_owned(),
            paths: vec![p],
            requires_admin: false,
            optional: false,
            in_quick_profile: false,
            in_deep_profile: true,
            related_apps: vec![],
        });
    }

    // =========================================================================
    // 2. Game Launchers & Game Leftovers (Cache / Logs / Crashes ONLY)
    // =========================================================================
    {
        let mut riot_paths = Vec::new();
        if let Some(ref l) = local {
            let rc = l.join("Riot Games").join("Riot Client");
            riot_paths.push(rc.join("Cache"));
            riot_paths.push(rc.join("Logs"));
            riot_paths.push(rc.join("Crashes"));

            let val_saved = l.join("VALORANT").join("Saved");
            riot_paths.push(val_saved.join("Logs"));
            riot_paths.push(val_saved.join("Crashes"));
            riot_paths.extend(find_prefixed_subdirs(&val_saved, "webcache"));
        }
        // Default LoL logs directory (never touches Config, replays, or game files)
        riot_paths.push(PathBuf::from(r"C:\Riot Games\League of Legends\Logs"));

        let display = local
            .as_ref()
            .map(|l| l.join("Riot Games").join("Riot Client").to_string_lossy().into_owned())
            .unwrap_or_else(|| r"%LOCALAPPDATA%\Riot Games\Riot Client".into());

        targets.push(CleanTargetDef {
            id: "riot_cache_logs".into(),
            category: CategoryId::GameLaunchers,
            kind: TargetKind::Directory,
            display_path: format!(r"{display}\(Cache, Logs, Crashes)"),
            paths: riot_paths,
            requires_admin: false,
            optional: false,
            in_quick_profile: true,
            in_deep_profile: true,
            related_apps: vec!["riot".into()],
        });
    }

    {
        let mut steam_roots = vec![
            PathBuf::from(r"C:\Program Files (x86)\Steam"),
            PathBuf::from(r"C:\Program Files\Steam"),
        ];
        if let Some(ref l) = local {
            steam_roots.push(l.join("Steam"));
        }

        let mut steam_paths = Vec::new();
        let mut display_root = PathBuf::from(r"C:\Program Files (x86)\Steam");
        for root in &steam_roots {
            if root.exists() {
                display_root = root.clone();
            }
            steam_paths.push(root.join("appcache").join("httpcache"));
            steam_paths.push(root.join("logs"));
            steam_paths.push(root.join("dumps"));
        }

        targets.push(CleanTargetDef {
            id: "steam_cache".into(),
            category: CategoryId::GameLaunchers,
            kind: TargetKind::Directory,
            display_path: format!(
                r"{}\(appcache\httpcache, logs, dumps)",
                display_root.to_string_lossy()
            ),
            paths: steam_paths,
            requires_admin: false,
            optional: false,
            in_quick_profile: true,
            in_deep_profile: true,
            related_apps: vec!["steam".into()],
        });
    }

    if let Some(ref l) = local {
        let saved = l.join("EpicGamesLauncher").join("Saved");
        let mut epic_paths = find_prefixed_subdirs(&saved, "webcache");
        if epic_paths.is_empty() {
            epic_paths.push(saved.join("webcache"));
        }
        epic_paths.push(saved.join("Logs"));
        epic_paths.push(saved.join("Crashes"));

        targets.push(CleanTargetDef {
            id: "epic_cache".into(),
            category: CategoryId::GameLaunchers,
            kind: TargetKind::Directory,
            display_path: format!(r"{}\(webcache*, Logs, Crashes)", saved.to_string_lossy()),
            paths: epic_paths,
            requires_admin: false,
            optional: false,
            in_quick_profile: true,
            in_deep_profile: true,
            related_apps: vec!["epic".into()],
        });
    }

    {
        let mut bnet_paths = Vec::new();
        if let Some(ref l) = local {
            let b = l.join("Battle.net");
            bnet_paths.push(b.join("BrowserCache"));
            bnet_paths.push(b.join("Cache"));
        }
        if let Some(ref r) = roaming {
            bnet_paths.push(r.join("Battle.net").join("Logs"));
        }
        bnet_paths.push(
            prog_data
                .join("Blizzard Entertainment")
                .join("Battle.net")
                .join("Cache"),
        );

        let display = local
            .as_ref()
            .map(|l| l.join("Battle.net").to_string_lossy().into_owned())
            .unwrap_or_else(|| r"%LOCALAPPDATA%\Battle.net".into());

        targets.push(CleanTargetDef {
            id: "battlenet_cache".into(),
            category: CategoryId::GameLaunchers,
            kind: TargetKind::Directory,
            display_path: format!(r"{display}\(BrowserCache, Cache, Logs)"),
            paths: bnet_paths,
            requires_admin: false,
            optional: false,
            in_quick_profile: true,
            in_deep_profile: true,
            related_apps: vec!["battlenet".into()],
        });
    }

    if let Some(ref l) = local {
        let ubi = l.join("Ubisoft Game Launcher");
        targets.push(CleanTargetDef {
            id: "ubisoft_cache".into(),
            category: CategoryId::GameLaunchers,
            kind: TargetKind::Directory,
            display_path: format!(r"{}\(cache, logs, crashes)", ubi.to_string_lossy()),
            paths: vec![ubi.join("cache"), ubi.join("logs"), ubi.join("crashes")],
            requires_admin: false,
            optional: false,
            in_quick_profile: true,
            in_deep_profile: true,
            related_apps: vec!["ubisoft".into()],
        });

        let ea = l.join("Electronic Arts").join("EA Desktop");
        targets.push(CleanTargetDef {
            id: "ea_cache".into(),
            category: CategoryId::GameLaunchers,
            kind: TargetKind::Directory,
            display_path: format!(r"{}\(cache, Logs, Crashes)", ea.to_string_lossy()),
            paths: vec![ea.join("cache"), ea.join("Logs"), ea.join("Crashes")],
            requires_admin: false,
            optional: false,
            in_quick_profile: true,
            in_deep_profile: true,
            related_apps: vec!["ea".into()],
        });
    }

    // =========================================================================
    // 3. Streaming & Communication Apps
    // =========================================================================
    if let Some(ref r) = roaming {
        let mut discord_paths = Vec::new();
        for variant in ["discord", "discordptb", "discordcanary"] {
            let base = r.join(variant);
            discord_paths.push(base.join("Cache"));
            discord_paths.push(base.join("Code Cache"));
            discord_paths.push(base.join("GPUCache"));
            discord_paths.push(base.join("Crashpad"));
        }

        targets.push(CleanTargetDef {
            id: "discord_cache".into(),
            category: CategoryId::StreamingComms,
            kind: TargetKind::Directory,
            display_path: format!(
                r"{}\discord*\(Cache, Code Cache, GPUCache, Crashpad)",
                r.to_string_lossy()
            ),
            paths: discord_paths,
            requires_admin: false,
            optional: false,
            in_quick_profile: true,
            in_deep_profile: true,
            related_apps: vec!["discord".into()],
        });

        let obs = r.join("obs-studio");
        targets.push(CleanTargetDef {
            id: "obs_logs".into(),
            category: CategoryId::StreamingComms,
            kind: TargetKind::Directory,
            display_path: format!(r"{}\(logs, crashes)", obs.to_string_lossy()),
            paths: vec![obs.join("logs"), obs.join("crashes")],
            requires_admin: false,
            optional: false,
            in_quick_profile: true,
            in_deep_profile: true,
            related_apps: vec!["obs".into()],
        });
    }

    if let Some(ref l) = local {
        let p = l.join("Spotify").join("Storage");
        targets.push(CleanTargetDef {
            id: "spotify_cache".into(),
            category: CategoryId::StreamingComms,
            kind: TargetKind::Directory,
            display_path: p.to_string_lossy().into_owned(),
            paths: vec![p],
            requires_admin: false,
            optional: true,
            in_quick_profile: false,
            in_deep_profile: false,
            related_apps: vec!["spotify".into()],
        });
    }

    // =========================================================================
    // 4. Windows Temporary Files
    // =========================================================================
    {
        let p = std::env::temp_dir();
        targets.push(CleanTargetDef {
            id: "user_temp".into(),
            category: CategoryId::WindowsTemp,
            kind: TargetKind::Directory,
            display_path: p.to_string_lossy().into_owned(),
            paths: vec![p],
            requires_admin: false,
            optional: false,
            in_quick_profile: true,
            in_deep_profile: true,
            related_apps: vec![],
        });
    }

    if let Some(ref l) = local {
        let p = l.join("CrashDumps");
        targets.push(CleanTargetDef {
            id: "crash_dumps".into(),
            category: CategoryId::WindowsTemp,
            kind: TargetKind::Directory,
            display_path: p.to_string_lossy().into_owned(),
            paths: vec![p],
            requires_admin: false,
            optional: false,
            in_quick_profile: true,
            in_deep_profile: true,
            related_apps: vec![],
        });
    }

    {
        let p = win_dir.join("Temp");
        targets.push(CleanTargetDef {
            id: "system_temp".into(),
            category: CategoryId::WindowsTemp,
            kind: TargetKind::Directory,
            display_path: p.to_string_lossy().into_owned(),
            paths: vec![p],
            requires_admin: true,
            optional: false,
            in_quick_profile: true,
            in_deep_profile: true,
            related_apps: vec![],
        });

        let p = win_dir.join("SoftwareDistribution").join("Download");
        targets.push(CleanTargetDef {
            id: "windows_update_cache".into(),
            category: CategoryId::WindowsTemp,
            kind: TargetKind::Directory,
            display_path: p.to_string_lossy().into_owned(),
            paths: vec![p],
            requires_admin: true,
            optional: false,
            in_quick_profile: false,
            in_deep_profile: true,
            related_apps: vec![],
        });
    }

    {
        targets.push(CleanTargetDef {
            id: "recycle_bin".into(),
            category: CategoryId::WindowsTemp,
            kind: TargetKind::RecycleBin,
            display_path: "Windows Recycle Bin".into(),
            paths: vec![],
            requires_admin: false,
            optional: true,
            in_quick_profile: false,
            in_deep_profile: false,
            related_apps: vec![],
        });
    }

    targets
}
