use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CategoryId {
    GpuShader,
    GameLaunchers,
    StreamingComms,
    WindowsTemp,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TargetKind {
    Directory,
    RecycleBin,
}

/// Internal definition of a strictly whitelisted cleaning target.
#[derive(Debug, Clone)]
pub struct CleanTargetDef {
    pub id: String,
    pub category: CategoryId,
    pub kind: TargetKind,
    pub paths: Vec<PathBuf>,
    pub display_path: String,
    pub requires_admin: bool,
    pub optional: bool,
    pub in_quick_profile: bool,
    pub in_deep_profile: bool,
    pub related_apps: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TargetScanResult {
    pub id: String,
    pub category: CategoryId,
    pub kind: TargetKind,
    pub paths: Vec<String>,
    pub display_path: String,
    pub primary_existing_path: Option<String>,
    pub exists: bool,
    pub size_bytes: u64,
    pub file_count: u64,
    pub requires_admin: bool,
    pub optional: bool,
    pub in_quick_profile: bool,
    pub in_deep_profile: bool,
    pub related_apps: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResponse {
    pub targets: Vec<TargetScanResult>,
    pub total_size_bytes: u64,
    pub total_file_count: u64,
    pub duration_ms: u64,
    pub is_admin: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanProgressEvent {
    pub completed: usize,
    pub total: usize,
    pub current_target_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CleanProgressEvent {
    pub completed: usize,
    pub total: usize,
    pub current_target_id: String,
    pub cleaned_bytes_so_far: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TargetCleanResult {
    pub id: String,
    pub cleaned_bytes: u64,
    pub deleted_files: u64,
    pub skipped_files: u64,
    pub skipped_admin: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CleanResponse {
    pub total_cleaned_bytes: u64,
    pub total_deleted_files: u64,
    pub total_skipped_files: u64,
    pub duration_ms: u64,
    pub results: Vec<TargetCleanResult>,
    pub updated_stats: LifetimeStats,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RunningAppInfo {
    pub id: String,
    pub display_name: String,
    pub affected_target_ids: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct LifetimeStats {
    pub total_cleaned_bytes: u64,
    pub total_files_deleted: u64,
    pub clean_count: u64,
    pub last_cleaned_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemInfo {
    pub is_admin: bool,
    pub app_version: String,
}
