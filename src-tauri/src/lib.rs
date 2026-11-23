mod cleaner;
mod models;
mod processes;
mod scanner;
mod stats;
mod system;
mod targets;

use models::{CleanResponse, LifetimeStats, RunningAppInfo, ScanResponse, SystemInfo};
use std::path::Path;
use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

#[tauri::command]
fn get_system_info() -> SystemInfo {
    SystemInfo {
        is_admin: system::is_admin(),
        app_version: env!("CARGO_PKG_VERSION").to_string(),
    }
}

#[tauri::command]
async fn scan_targets(app: AppHandle) -> Result<ScanResponse, String> {
    tauri::async_runtime::spawn_blocking(move || scanner::run_parallel_scan(&app))
        .await
        .map_err(|e| format!("Scan task failed: {e}"))
}

#[tauri::command]
async fn clean_targets(app: AppHandle, target_ids: Vec<String>) -> Result<CleanResponse, String> {
    tauri::async_runtime::spawn_blocking(move || cleaner::run_clean(&app, target_ids))
        .await
        .map_err(|e| format!("Clean task failed: {e}"))
}

#[tauri::command]
async fn get_running_apps() -> Result<Vec<RunningAppInfo>, String> {
    tauri::async_runtime::spawn_blocking(processes::detect_running_apps)
        .await
        .map_err(|e| format!("Process detection failed: {e}"))
}

#[tauri::command]
fn get_stats() -> LifetimeStats {
    stats::load_stats()
}

#[tauri::command]
fn open_folder(app: AppHandle, path: String) -> Result<(), String> {
    let target_path = Path::new(&path);
    if !target_path.exists() {
        return Err("Folder does not exist on this system.".to_string());
    }
    app.opener()
        .open_path(path, None::<&str>)
        .map_err(|e| format!("Failed to open folder: {e}"))
}

#[tauri::command]
fn restart_as_admin(app: AppHandle) -> Result<(), String> {
    system::restart_as_admin()?;
    app.exit(0);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            scan_targets,
            clean_targets,
            get_running_apps,
            get_stats,
            open_folder,
            restart_as_admin,
        ])
        .run(tauri::generate_context!())
        .expect("error while running StreamClean");
}
