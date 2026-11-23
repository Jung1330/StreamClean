export type CategoryId =
  | "gpu_shader"
  | "game_launchers"
  | "streaming_comms"
  | "windows_temp";

export type TargetKind = "directory" | "recycle_bin";

export type ProfileId = "quick" | "deep" | "custom";

export type Language = "tr" | "en";

export interface TargetScanResult {
  id: string;
  category: CategoryId;
  kind: TargetKind;
  paths: string[];
  displayPath: string;
  primaryExistingPath: string | null;
  exists: boolean;
  sizeBytes: number;
  fileCount: number;
  requiresAdmin: boolean;
  optional: boolean;
  inQuickProfile: boolean;
  inDeepProfile: boolean;
  relatedApps: string[];
}

export interface ScanResponse {
  targets: TargetScanResult[];
  totalSizeBytes: number;
  totalFileCount: number;
  durationMs: number;
  isAdmin: boolean;
}

export interface ScanProgressEvent {
  completed: number;
  total: number;
  currentTargetId: string;
}

export interface CleanProgressEvent {
  completed: number;
  total: number;
  currentTargetId: string;
  cleanedBytesSoFar: number;
}

export interface TargetCleanResult {
  id: string;
  cleanedBytes: number;
  deletedFiles: number;
  skippedFiles: number;
  skippedAdmin: boolean;
}

export interface LifetimeStats {
  totalCleanedBytes: number;
  totalFilesDeleted: number;
  cleanCount: number;
  lastCleanedAt: string | null;
}

export interface CleanResponse {
  totalCleanedBytes: number;
  totalDeletedFiles: number;
  totalSkippedFiles: number;
  durationMs: number;
  results: TargetCleanResult[];
  updatedStats: LifetimeStats;
}

export interface RunningAppInfo {
  id: string;
  displayName: string;
  affectedTargetIds: string[];
}

export interface SystemInfo {
  isAdmin: boolean;
  appVersion: string;
}
