use crate::models::RunningAppInfo;
use std::collections::HashSet;
use sysinfo::{ProcessRefreshKind, ProcessesToUpdate, System};

struct AppSignature {
    id: &'static str,
    display_name: &'static str,
    process_names: &'static [&'static str],
    affected_targets: &'static [&'static str],
}

const MONITORED_APPS: &[AppSignature] = &[
    AppSignature {
        id: "discord",
        display_name: "Discord",
        process_names: &["discord.exe", "discordptb.exe", "discordcanary.exe"],
        affected_targets: &["discord_cache"],
    },
    AppSignature {
        id: "steam",
        display_name: "Steam",
        process_names: &["steam.exe", "steamwebhelper.exe"],
        affected_targets: &["steam_cache"],
    },
    AppSignature {
        id: "riot",
        display_name: "Riot Client / Game",
        process_names: &[
            "riotclientservices.exe",
            "riotclientux.exe",
            "leagueclient.exe",
            "league of legends.exe",
            "valorant.exe",
            "valorant-win64-shipping.exe",
        ],
        affected_targets: &["riot_cache_logs"],
    },
    AppSignature {
        id: "epic",
        display_name: "Epic Games",
        process_names: &["epicgameslauncher.exe", "epicwebhelper.exe"],
        affected_targets: &["epic_cache"],
    },
    AppSignature {
        id: "battlenet",
        display_name: "Battle.net",
        process_names: &["battle.net.exe", "agent.exe"],
        affected_targets: &["battlenet_cache"],
    },
    AppSignature {
        id: "ubisoft",
        display_name: "Ubisoft Connect",
        process_names: &["upc.exe", "ubisoftconnect.exe"],
        affected_targets: &["ubisoft_cache"],
    },
    AppSignature {
        id: "ea",
        display_name: "EA App",
        process_names: &["eadesktop.exe", "eabackgroundservice.exe"],
        affected_targets: &["ea_cache"],
    },
    AppSignature {
        id: "obs",
        display_name: "OBS Studio",
        process_names: &["obs64.exe", "obs32.exe"],
        affected_targets: &["obs_logs"],
    },
    AppSignature {
        id: "spotify",
        display_name: "Spotify",
        process_names: &["spotify.exe"],
        affected_targets: &["spotify_cache"],
    },
];

pub fn detect_running_apps() -> Vec<RunningAppInfo> {
    let mut sys = System::new();
    sys.refresh_processes_specifics(
        ProcessesToUpdate::All,
        true,
        ProcessRefreshKind::nothing(),
    );

    let running_names: HashSet<String> = sys
        .processes()
        .values()
        .map(|p| p.name().to_string_lossy().to_ascii_lowercase())
        .collect();

    MONITORED_APPS
        .iter()
        .filter(|app| {
            app.process_names
                .iter()
                .any(|proc_name| running_names.contains(*proc_name))
        })
        .map(|app| RunningAppInfo {
            id: app.id.to_string(),
            display_name: app.display_name.to_string(),
            affected_target_ids: app.affected_targets.iter().map(|s| s.to_string()).collect(),
        })
        .collect()
}
