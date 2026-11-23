use crate::models::{
    CleanTargetDef, ScanProgressEvent, ScanResponse, TargetKind, TargetScanResult,
};
use crate::system;
use crate::targets::build_targets;
use rayon::prelude::*;
use std::path::Path;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Instant;
use tauri::{AppHandle, Emitter};
use walkdir::WalkDir;

fn scan_directory(path: &Path) -> (u64, u64) {
    if !path.exists() {
        return (0, 0);
    }

    let mut total_size: u64 = 0;
    let mut file_count: u64 = 0;

    // Never follow symlinks/junctions to guarantee whitelist containment.
    for entry in WalkDir::new(path).follow_links(false).into_iter().flatten() {
        if entry.file_type().is_file() {
            if let Ok(meta) = entry.metadata() {
                total_size = total_size.saturating_add(meta.len());
                file_count = file_count.saturating_add(1);
            }
        }
    }

    (total_size, file_count)
}

fn scan_single_target(def: &CleanTargetDef) -> TargetScanResult {
    match def.kind {
        TargetKind::RecycleBin => {
            let (size_bytes, file_count) = system::query_recycle_bin();
            TargetScanResult {
                id: def.id.clone(),
                category: def.category,
                kind: def.kind,
                paths: vec![],
                display_path: def.display_path.clone(),
                primary_existing_path: None,
                exists: true,
                size_bytes,
                file_count,
                requires_admin: def.requires_admin,
                optional: def.optional,
                in_quick_profile: def.in_quick_profile,
                in_deep_profile: def.in_deep_profile,
                related_apps: def.related_apps.clone(),
            }
        }
        TargetKind::Directory => {
            let mut total_size: u64 = 0;
            let mut total_files: u64 = 0;
            let mut existing_paths: Vec<String> = Vec::new();
            let mut primary_existing: Option<String> = None;

            for path in &def.paths {
                if path.exists() {
                    if primary_existing.is_none() {
                        primary_existing = Some(path.to_string_lossy().into_owned());
                    }
                    existing_paths.push(path.to_string_lossy().into_owned());
                    let (sz, cnt) = scan_directory(path);
                    total_size = total_size.saturating_add(sz);
                    total_files = total_files.saturating_add(cnt);
                }
            }

            let exists = !existing_paths.is_empty();
            let all_paths = if exists {
                existing_paths
            } else {
                def.paths
                    .iter()
                    .map(|p| p.to_string_lossy().into_owned())
                    .collect()
            };

            TargetScanResult {
                id: def.id.clone(),
                category: def.category,
                kind: def.kind,
                paths: all_paths,
                display_path: def.display_path.clone(),
                primary_existing_path: primary_existing,
                exists,
                size_bytes: total_size,
                file_count: total_files,
                requires_admin: def.requires_admin,
                optional: def.optional,
                in_quick_profile: def.in_quick_profile,
                in_deep_profile: def.in_deep_profile,
                related_apps: def.related_apps.clone(),
            }
        }
    }
}

pub fn run_parallel_scan(app: &AppHandle) -> ScanResponse {
    let start = Instant::now();
    let defs = build_targets();
    let total = defs.len();
    let completed = AtomicUsize::new(0);
    let is_admin = system::is_admin();

    let results: Vec<TargetScanResult> = defs
        .par_iter()
        .map(|def| {
            let res = scan_single_target(def);
            let done = completed.fetch_add(1, Ordering::Relaxed) + 1;
            let _ = app.emit(
                "scan-progress",
                ScanProgressEvent {
                    completed: done,
                    total,
                    current_target_id: def.id.clone(),
                },
            );
            res
        })
        .collect();

    let total_size_bytes: u64 = results.iter().map(|r| r.size_bytes).sum();
    let total_file_count: u64 = results.iter().map(|r| r.file_count).sum();

    ScanResponse {
        targets: results,
        total_size_bytes,
        total_file_count,
        duration_ms: start.elapsed().as_millis() as u64,
        is_admin,
    }
}
