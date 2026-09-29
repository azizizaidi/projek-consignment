# PLAN — Sistem Inventori + Consignment

**Tarikh:** 2026-09-27
**Status:** DILULUSKAN oleh Tuan (2026-09-26/27) — draf asal dibina secara interaktif, 5 pusingan semakan.
**Peringkat:** Fasa 0 (spesifikasi). Tiada kod ditulis lagi.

---

## 1. Latar belakang & matlamat

Tuan Azizi adalah **supplier** produk sachet (air koko), unit jualan = **1 papan**.
**Produk tunggal sahaja: Papan Sachet Koko** — tiada produk lain dalam sistem.
Barang ditempatkan di kedai-kedai runcit (5–20 buah) yang diuruskan oleh staf kawasan.

**Matlamat sistem:** menggantikan catatan manual/WhatsApp dengan sistem web yang:

1. Mengekalkan ketepatan stok gudang dan stok di setiap kedai.
2. Menjejak setiap papan yang ditempatkan di kedai sehingga habis.
3. Merancang kutipan pembayaran (cash / QR dalam talian) tepat pada masanya.
4. Memberi Tuan laporan jualan, kutipan, dan baki tanpa kiraan manual.

## 2. Model perniagaan

### 2.1 Dua mod bayar untuk setiap kedai
| Mod | Masa bayar |
|---|---|
| **Bayar dulu (beli putus)** | Owner kedai bayar masa terima stok |
| **Bayar kemudian (consignment)** | Owner kedai bayar bila **1 papan habis** |

### 2.2 Kitaran operasi (event-driven, bukan kitaran bulanan)
1. Staf hantar papan ke kedai (penempatan stok).
2. Bila **papan habis** → staf **collect payment** untuk papan tersebut.
3. Sekaligus **restok** papan baru (tindakan "kutip + restok" dalam satu skrin).
4. Bayaran dijalankan secara **cash** (staf rekod + nombor resit) atau **online** (pautan Billplz — DuitNow QR / FPX — dihantar via WhatsApp kepada owner kedai).

Tiada invois bulanan. Setiap peristiwa *papan habis* menjana satu tanggungjawab bayaran.

### 2.3 Prinsip kiraan
- Jumlah kutipan = bilangan papan × harga per papan (disnapshot pada masa penempatan).
- Bayaran separa dibenarkan: status kutipan *belum bayar → separa → dibayar*.
- Yuran transaksi gateway (MDR) **ditanggung oleh Tuan** — jumlah yang kedai bayar = tepat jumlah kutipan.

## 3. Peranan & akses

| Peranan | Akses |
|---|---|
| **Superadmin** (Tuan, owner supplier) | Semua kawasan: daftar owner kedai & staf, tetapkan kawasan staf, produk/harga, laporan penuh, tetapan pembayaran |
| **Staf kawasan** | Hanya kedai dalam kawasan yang didaftarkan: senarai kedai, halaman kedai (sejarah + status semasa), rekod penempatan, kutipan & restok |
| Owner kedai | **Tiada login** dalam fasa awal — menerima pautan bayar via WhatsApp sahaja |

Semua tindakan pengguna direkod dalam log audit (siapa, bila, apa).

## 4. Modul sistem

| Modul | Fungsi |
|---|---|
| Produk & Gudang | **Produk tunggal** (Papan Sachet Koko — unit: papan, harga per papan), stok gudang, pergerakan (masuk, hantar ke kedai, pulangan, rosak, adjustment) |
| Outlet & Owner | Maklumat kedai/owner, kawasan, mod bayar default, staf kawasan bertugas, harga khas (pilihan) |
| Penempatan Stok | Hantar papan ke kedai: mod bayar, kuantiti, harga snapshot, status (aktif → habis) |
| Koleksi & Restok | Event *papan habis* → kutip bayaran (N papan × harga) → restok papan baru. Papan belum habis = baki/potensi kutipan |
| Pembayaran | Cash (rekod manual + resit) • Online: Billplz (DuitNow QR / FPX), webhook auto-sah |
| KPI & Bonus Staf | Superadmin set **KPI kutipan bulanan + bonus berbeza untuk setiap staf**. Bonus hanya dilepaskan bila KPI dicapai — **tak cukup KPI = tiada bonus** |
| Laporan | Papan di setiap kedai, papan habis/belum, kutipan (cash vs online), baki belum kutip, prestasi kedai & staf, status KPI/bonus |
| Pengguna & Audit | Login (superadmin, staf), penugasan kawasan, log audit |

## 5. Reka bentuk UI staf (mobile-first — staf guna telefon di lapangan)

1. **Login staf** → senarai kedai kawasan sendiri; setiap kad ringkas: nama kedai, bilangan papan aktif, baki belum kutip.
2. **Tekan kedai** → halaman kedai papar:
   - **Status semasa consignment:** papan aktif (belum habis), mod bayar (bayar dulu / bayar kemudian), tarikh hantar terakhir, baki belum kutip.
   - **Aksi pantas:**
     - 📦 Rekod *papan habis* + kutip bayaran + restok (satu transaksi)
     - ➕ Hantar papan baru
     - 💰 Rekod bayaran (cash / jana pautan QR Billplz → WhatsApp ke owner)
   - **Sejarah:** timeline penuh — setiap penempatan papan, setiap kutipan pembayaran (kaedah, jumlah, rujukan resit/bill).
3. **Superadmin:** semua kawasan + daftar kedai/owner/staf + laporan penuh + tetapan produk/harga/pembayaran.

## 6. Pembayaran

| Aspek | Reka bentuk |
|---|---|
| Gateway | **Billplz** (DuitNow QR + FPX) — dipilih kerana cara bayar paling biasa kedai kecil Malaysia |
| Cash | Staf rekod manual dengan nombor resit |
| Aliran online | Sistem jana *bill* Billplz untuk setiap kutipan → pautan/QR dihantar via WhatsApp → **webhook** sahkan → status kutipan auto-kemas kini |
| Keselamatan | Pengesahan tandatangan webhook + log setiap event gateway (idempoten — retry webhook tidak mendaftar bayaran dua kali); status tidak dipercayai dari redirect browser sahaja |
| Fallback | Jika webhook gagal, staf boleh rekod manual dengan justifikasi (audit log) |

## 7. Teknologi

- **Backend:** FastAPI (Python)
- **UI:** Jinja2 + HTMX (ringan; antara muka staf dioptimum untuk telefon)
- **DB:** SQLite dulu → PostgreSQL bila perlu (migrasi via SQLAlchemy/Alembic)
- **Auth:** sesi login + peranan (superadmin / staf)
- **Integrasi:** REST API Billplz + webhook
- **Deploy:** Docker di VPS / localhost semasa fasa awal

## 8. Fasa pembangunan

| Fasa | Kandungan | Definisi siap |
|---|---|---|
| 0 | Spesifikasi + skema DB + reka bentuk UI kasar | Dokumen diluluskan Tuan *(semasa)* |
| 1 | Produk + stok gudang + daftar outlet/owner + staf kawasan + login | Data asas lengkap, stok gudang tepat, staf nampak kedai kawasan sendiri |
| 2 | Penempatan papan ke kedai (2 mod) + halaman kedai (status + sejarah) | Setiap papan di kedai boleh diaudit |
| 3 | Koleksi pembayaran + restok (cash manual) | Satu kitaran penuh *habis → kutip → restok* berfungsi |
| 4 | Integrasi Billplz (QR/FPX, webhook auto-sah) + pautan WhatsApp | Kedai boleh bayar QR dalam talian, status auto-tepat |
| 5 | Laporan & dashboard (kutipan, baki, prestasi kedai/staf) | Tuan nampak semua tanpa query manual |
| 6 | Login owner kedai + penambahbaikan | Kedai semak sendiri stok & bayar |

## 9. Keputusan yang telah diluluskan (rekod jawapan Tuan)

1. Skala: **sederhana, 5–20 kedai, ada staf** — web app, Python/FastAPI.
2. Laporan jualan oleh kedai: **manual oleh staf** (bukan integrasi POS).
3. Gateway: **Billplz** dengan pengesahan **auto via webhook**.
4. Akses: **superadmin daftarkan maklumat owner kedai** — tiada login kedai di fasa awal.
5. Model bayar: **2 opsyen per kedai — bayar dulu / bayar kemudian (consignment)**, unit = 1 papan.
6. Kutipan: **bila 1 papan habis → staf collect payment untuk restok** (event-driven).
7. Yuran gateway (MDR): **Tuan tanggung**.
8. Jualan direct (bukan consignment): **tidak**.
9. Staf: login sendiri, lihat hanya kedai kawasan yang didaftarkan; halaman kedai papar **sejarah + status semasa consignment**.

## 10. Andaian yang belum muktamad (untuk disahkan di Fasa 0/1)

| # | Andaian semasa | Alternatif |
|---|---|---|
| 1 | Harga per papan **tetap untuk semua kedai**, dengan medan *harga khas per kedai* (nullable) disediakan awal | Harga tetap sahaja tanpa harga khas |
| 2 | Staf ditugaskan ikut **kawasan** (kedai ada medan kawasan; staf boleh pegang ≥1 kawasan) | Penugasan terus ke kedai individu |

## 11. Di luar skop (fasa awal)

- Integrasi POS kedai • Pembayaran selain Billplz/cash • Aplikasi mudah alih asli (web mobile-first dahulu)
- Nombor siri / batch • Inventori per unit sachet (unit rasmi = papan) • Multi-gudang

---

## Rujukan
- Skema pangkalan data: [schema.md](schema.md)
