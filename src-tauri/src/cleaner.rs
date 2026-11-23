use crate::models::{
    CleanProgressEvent, CleanResponse, CleanTargetDef, TargetCleanResult, TargetKind,
};
use crate::stats;
use crate::system;
use crate::targets::build_targets;
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::Path;
use std::time::Instant;
use tauri::{AppHandle, Emitter};
use walkdir::WalkDir;

/// Cleans all files and empty subdirectories inside a whitelisted root directory.
/// Never removes the whitelisted root directory itself and never follows symlinks.
/// Silently skips any file locked by a running application.
fn clean_directory_contents(root: &Path) -> (u64, u64, u64) {
    if !root.exists() {
        return (0, 0, 0);
    }

    let mut cleaned_bytes: u64 = 0;
    let mut deleted_files: u64 = 0;
    let mut skipped_files: u64 = 0;

    // contents_first(true) visits files before their parent directories.
    for entry in WalkDir::new(root)
        .min_depth(1)
        .follow_links(false)
        .contents_first(true)
        .into_iter()
        .flatten()
    {
        let path = entry.path();
        let file_type = entry.file_type();

        if file_type.is_file() {
            let file_size = entry.metadata().map(|m| m.len()).unwrap_or(0);
            match fs::remove_file(path) {
                Ok(()) => {
                    cleaned_bytes = cleaned_bytes.saturating_add(file_size);
                    deleted_files = deleted_files.saturating_add(1);
                }
                Err(_) => {
                    // File is locked / in use or lacks permission — safely skip.
                    skipped_files = skipped_files.saturating_add(1);
                }
            }
        } else if file_type.is_dir() {
            // Only removes empty subdirectories; ignores non-empty/in-use dirs.
            let _ = fs::remove_dir(path);
        }
    }

    (cleaned_bytes, deleted_files, skipped_files)
}

fn clean_single_target(def: &CleanTargetDef, is_admin: bool) -> TargetCleanResult {
    if def.requires_admin && !is_admin {
        return TargetCleanResult {
            id: def.id.clone(),
            cleaned_bytes: 0,
            deleted_files: 0,
            skipped_files: 0,
            skipped_admin: true,
        };
    }

    match def.kind {
        TargetKind::RecycleBin => {
            let (cleaned_bytes, deleted_files) = system::empty_recycle_bin();
            TargetCleanResult {
                id: def.id.clone(),
                cleaned_bytes,
                deleted_files,
                skipped_files: 0,
                skipped_admin: false,
            }
        }
        TargetKind::Directory => {
            let mut total_bytes = 0u64;
            let mut total_deleted = 0u64;
            let mut total_skipped = 0u64;

            for path in &def.paths {
                let (b, d, s) = clean_directory_contents(path);
                total_bytes = total_bytes.saturating_add(b);
                total_deleted = total_deleted.saturating_add(d);
                total_skipped = total_skipped.saturating_add(s);
            }

            TargetCleanResult {
                id: def.id.clone(),
                cleaned_bytes: total_bytes,
                deleted_files: total_deleted,
                skipped_files: total_skipped,
                skipped_admin: false,
            }
        }
    }
}

pub fn run_clean(app: &AppHandle, target_ids: Vec<String>) -> CleanResponse {
    let start = Instant::now();
    let is_admin = system::is_admin();

    // Build whitelist map: only IDs present in `build_targets()` can ever be cleaned.
    let whitelist: HashMap<String, CleanTargetDef> = build_targets()
        .into_iter()
        .map(|t| (t.id.clone(), t))
        .collect();

    // Deduplicate while preserving order.
    let mut seen = HashSet::new();
    let selected_defs: Vec<&CleanTargetDef> = target_ids
        .into_iter()
        .filter(|id| seen.insert(id.clone()))
        .filter_map(|id| whitelist.get(&id))
        .collect();

    let total = selected_defs.len();
    let mut results = Vec::with_capacity(total);
    let mut total_cleaned_bytes = 0u64;
    let mut total_deleted_files = 0u64;
    let mut total_skipped_files = 0u64;

    for (idx, def) in selected_defs.into_iter().enumerate() {
        let res = clean_single_target(def, is_admin);
        total_cleaned_bytes = total_cleaned_bytes.saturating_add(res.cleaned_bytes);
        total_deleted_files = total_deleted_files.saturating_add(res.deleted_files);
        total_skipped_files = total_skipped_files.saturating_add(res.skipped_files);

        let _ = app.emit(
            "clean-progress",
            CleanProgressEvent {
                completed: idx + 1,
                total,
                current_target_id: def.id.clone(),
                cleaned_bytes_so_far: total_cleaned_bytes,
            },
        );

        results.push(res);
    }

    let updated_stats = stats::record_clean(total_cleaned_bytes, total_deleted_files);

    CleanResponse {
        total_cleaned_bytes,
        total_deleted_files,
        total_skipped_files,
        duration_ms: start.elapsed().as_millis() as u64,
        results,
        updated_stats,
    }
}
