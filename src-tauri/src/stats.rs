use crate::models::LifetimeStats;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

fn stats_file_path() -> Option<PathBuf> {
    dirs::config_dir().map(|dir| dir.join("StreamClean").join("stats.json"))
}

pub fn load_stats() -> LifetimeStats {
    let Some(path) = stats_file_path() else {
        return LifetimeStats::default();
    };
    match fs::read_to_string(&path) {
        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
        Err(_) => LifetimeStats::default(),
    }
}

pub fn record_clean(cleaned_bytes: u64, deleted_files: u64) -> LifetimeStats {
    let mut stats = load_stats();
    if cleaned_bytes > 0 || deleted_files > 0 {
        stats.total_cleaned_bytes = stats.total_cleaned_bytes.saturating_add(cleaned_bytes);
        stats.total_files_deleted = stats.total_files_deleted.saturating_add(deleted_files);
        stats.clean_count = stats.clean_count.saturating_add(1);
        stats.last_cleaned_at = Some(current_iso_utc());
        save_stats(&stats);
    }
    stats
}

fn save_stats(stats: &LifetimeStats) {
    let Some(path) = stats_file_path() else {
        return;
    };
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    if let Ok(json) = serde_json::to_string_pretty(stats) {
        let _ = fs::write(path, json);
    }
}

/// Formats current SystemTime as ISO-8601 UTC string without external date crates.
fn current_iso_utc() -> String {
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);

    let days = secs / 86_400;
    let rem = secs % 86_400;
    let hour = rem / 3_600;
    let minute = (rem % 3_600) / 60;
    let second = rem % 60;

    // Civil date from days since 1970-01-01 (Howard Hinnant's algorithm)
    let z = days as i64 + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = (z - era * 146_097) as u64;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146_096) / 365;
    let y = yoe as i64 + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = doy - (153 * mp + 2) / 5 + 1;
    let month = if mp < 10 { mp + 3 } else { mp - 9 };
    let year = if month <= 2 { y + 1 } else { y };

    format!("{year:04}-{month:02}-{day:02}T{hour:02}:{minute:02}:{second:02}Z")
}
