import type { Language } from "../types";

export function formatBytes(bytes: number, decimals = 2): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  const value = bytes / Math.pow(k, i);
  const fixed = i === 0 ? 0 : value >= 100 ? 1 : decimals;
  return `${value.toFixed(fixed)} ${sizes[i]}`;
}

export function formatNumber(n: number, lang: Language): string {
  return new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US").format(n);
}

export function formatDate(iso: string | null, lang: Language): string {
  if (!iso) return lang === "tr" ? "Henüz yok" : "Never";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}
