# StreamClean

![AI-Assisted](https://img.shields.io/badge/Built%20with-AI%20Assistance-06b6d4?style=flat-square)
![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)
![Platform: Windows 10/11](https://img.shields.io/badge/Platform-Windows%2010%2F11-3b82f6?style=flat-square)

> **Windows 10/11 için oyuncu ve yayıncı odaklı, %100 açık kaynaklı, güvenli ve ultra hızlı disk/cache temizleyici.**  
> **100% open-source, safe, ultra-fast disk & cache cleaner for gamers and streamers on Windows 10/11.**

*Bu proje yapay zekâ (AI) desteğiyle geliştirilmiştir. / Built with AI assistance.*

Built with **Rust + Tauri v2 + React + TypeScript + Tailwind CSS**.

---

## Türkçe Özet

**StreamClean**, oyun önbellekleri, GPU shader kalıntıları, yayıncı araçları ve Windows geçici dosyalarını güvenle temizlemek için tasarlanmış hafif bir masaüstü uygulamasıdır.

### Güvenlik İlkeleri (Kırmızı Çizgiler)
- **Sadece Whitelist:** Yalnızca önceden tanımlı güvenli önbellek ve log klasörleri taranır. Windows Kayıt Defteri (Registry), oyun save dosyaları, ayar/config dosyaları veya tarayıcı çerez/şifrelerine asla dokunulmaz.
- **Önce Tara (Dry-Run):** Onayınız olmadan hiçbir dosya silinmez. Paralel tarama (`rayon` + `walkdir`) ile her hedefin dosya sayısı, boyutu ve tam klasör yolu listelenir.
- **Kilitli Dosya Toleransı:** Discord, Steam veya çalışan bir oyun tarafından kilitlenen dosyalar sessizce atlanır ve temizlik sonunda detaylı özet raporu gösterilir.
- **İsteğe Bağlı Yönetici İzni (UAC):** Normal kullanıcı haklarıyla çalışır. Yalnızca `C:\Windows\Temp` ve `SoftwareDistribution\Download` için tek tıkla **"Yönetici Olarak Yeniden Başlat"** seçeneği sunar.

### Temizlik Kategorileri
1. **GPU & Shader Cache:** NVIDIA (`DXCache`, `GLCache`, `ComputeCache`, eski `Downloader` kalıntıları), AMD (`DxCache`, `GLCache`, `VkCache`) ve DirectX (`D3DSCache`).
2. **Oyun Launcher & Kalıntılar:** Riot Client / LoL / Valorant, Steam, Epic Games, Battle.net, Ubisoft Connect ve EA App (yalnızca cache, log ve çökme raporları).
3. **Yayıncı & İletişim:** Discord (Stable / PTB / Canary), OBS Studio (`logs` / `crashes`) ve Spotify (opsiyonel).
4. **Windows Geçici Dosyaları:** `%TEMP%`, `CrashDumps`, `C:\Windows\Temp`, `SoftwareDistribution\Download` ve Geri Dönüşüm Kutusu (opsiyonel).

### Öne Çıkan Özellikler
- **2 Hazır Profil:** *Hızlı Temizlik* (GPU shader'lara dokunmaz) ve *Derin Oyuncu Temizliği*.
- **Açık Uygulama Tespiti (`sysinfo`):** Discord, Steam, Riot, OBS vb. açıksa üstte bilgi çipi gösterir.
- **Klasörü İncele (🔍):** Her hedefin klasörünü doğrudan Windows Explorer'da açar.
- **Toplam İstatistik:** `%APPDATA%\StreamClean\stats.json` dosyasında bugüne kadar temizlenen toplam boyutu saklar.
- **TR / EN Dil Desteği:** Tek tıkla anlık dil değiştirme.

---

## English Overview

**StreamClean** is a lightweight, open-source desktop utility built for Windows 10/11 gamers and streamers to safely reclaim disk space without risking game saves, configs, or system stability.

### Core Safety Guarantees
- **Strict Whitelist Only:** Only curated cache, log, and temporary folders are ever scanned or cleaned. Never touches the Windows Registry, game saves, configs, replays, or browser passwords/cookies. Never follows symlinks.
- **Dry-Run First:** Parallel scanning (`rayon` + `walkdir`) previews exact folder paths, file counts, and sizes before you confirm anything.
- **Locked File Tolerance:** Gracefully skips files locked by running apps and shows a full post-clean breakdown (*cleaned size, deleted files, skipped locked files*).
- **Non-Elevated by Default:** Runs as a standard user and offers an optional **"Restart as Administrator"** UAC button strictly for Windows system temp and Windows Update cache folders.

---

## Development / Geliştirme

### Prerequisites / Gereksinimler
- [Rust](https://rustup.rs/) (stable toolchain)
- [Node.js](https://nodejs.org/) (LTS)
- Visual Studio C++ Build Tools & WebView2 (pre-installed on Windows 10/11)

### Run Locally / Yerel Çalıştırma

```bash
# Install frontend dependencies
npm install

# Start in development mode (Vite + Tauri)
npm run tauri dev

# Build production installer (.msi / .exe)
npm run tauri build
```

### Verification Commands

```bash
# TypeScript & Vite build check
npm run build

# Rust backend check
cd src-tauri && cargo check
```

---

## License

MIT License — 100% open source.
