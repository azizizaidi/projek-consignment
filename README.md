# SAS EMPIRE — Sistem Inventori & Consignment

Demo UI/UX sistem inventori + consignment untuk supplier **Papan Sachet Koko** (produk tunggal).

- **Staf kawasan** — lihat kedai dalam kawasan masing-masing, rekod penempatan papan, kutip bayaran bila papan habis, restok, hantar pautan bayar QR (Billplz).
- **Superadmin (owner)** — urus kedai, staf & kawasan, tetapkan **KPI + bonus berbeza setiap staf** (tak cukup KPI = tiada bonus), laporan, tetapan Billplz.
- Demo ini berfungsi penuh A→Z dengan data kekal (localStorage pelayar).

## Struktur

```
ui-demo/          → aplikasi demo (buka login.html)
  assets/         → CSS, data (localStorage), UI helpers, ikon PWA
  manifest.json   → PWA manifest
  sw.js           → service worker (guna luar talian)
PLAN.md           → pelan projek & aliran perniagaan
schema.md         → reka bentuk pangkalan data
```

## Cara guna (komputer)

Buka `ui-demo/login.html` dalam pelayar. Pilih akaun demo (Staf / Superadmin).

---

## 📱 Install di Android (Chrome)

1. Buka pautan demo dalam **Chrome**: `https://azizizaidi.github.io/projek-consignment/ui-demo/login.html`
2. Tekan menu **⋮** (tiga titik) di kanan atas.
3. Pilih **"Tambah ke skrin utama"** / *Add to Home screen*.
4. Beri nama **SAS EMPIRE** → tekan **Tambah / Install**.
5. Ikon **SAS EMPIRE** muncul di skrin utama — buka seperti app biasa (skrin penuh, tanpa bar alamat).

## 📱 Install di iPhone / iPad (Safari)

1. Buka pautan demo dalam **Safari**: `https://azizizaidi.github.io/projek-consignment/ui-demo/login.html`
2. Tekan butang **Share** (ikon kotak dengan anak panah ⬆) di bawah.
3. Tatal ke bawah → pilih **"Tambah ke Skrin Utama"** / *Add to Home Screen*.
4. Beri nama **SAS EMPIRE** → tekan **Tambah**.
5. Ikon **SAS EMPIRE** muncul di skrin utama.

> Nota: guna **Safari** untuk iPhone (Chrome di iOS tidak menyokong *Add to Home Screen* dengan betul).

## Ciri PWA

- ✅ Buka terus dari skrin utama, mod skrin penuh (seperti app)
- ✅ Ikon & splash skrin jenama SAS EMPIRE
- ✅ Boleh dibuka walaupun talian internet lemah (cache)
- ⚠️ Data demo disimpan dalam pelayar peranti masing-masing (localStorage) — *Reset Data Demo* ada dalam app.

## Pembangunan seterusnya (lihat PLAN.md)

Fasa 1–6: backend FastAPI + PostgreSQL, login sebenar, pembayaran Billplz (DuitNow QR + FPX) dengan webhook auto-sah, laporan penuh.
