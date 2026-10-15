# Redesign A–Z — 15 Oktober 2026

Snapshot kerja branch `feat/redesign-ui`. Rujuk sejarah Git untuk status commit dan merge terkini; deployment aplikasi produksi belum dibuat.

## Perubahan menyeluruh

Semua entry point HTML ditulis semula, bukan stylesheet override pada skrin lama.
Satu sumber TypeScript berkongsi komponen dan aliran kerja, dibundle untuk static hosting.
CSS dibina semula tanpa Tailwind CDN. Identiti navy/orange, Manrope/DM Sans,
logo SVG, ikon PWA, navigasi dan semua komponen borang/dialog baharu.

- Login: semua akaun demo daripada data; penerangan aliran operasi.
- Staf: dashboard harian baharu, keutamaan kutipan, sasaran KPI, senarai kedai
  dengan carian/penapis/keadaan kosong; butiran kedai dengan tab sejarah,
  penempatan dan bayaran; panel lawatan; laporan tempoh; profil.
- Superadmin: dashboard operasi, tambah/edit kedai, tambah/edit staf & kawasan,
  KPI/bonus, pengurusan produk, rekod stok dengan sebab, laporan, tetapan.
- Interaksi: dialog native berlabel, success notice, ralat inline, validasi native,
  fokus papan kekunci, skip link, penanda navigasi aktif, reduced motion.
- Bayaran: cash, separa, rekod hutang, QR simulasi + pengesahan dan perkongsian
  pautan demo melalui WhatsApp atas tindakan pengguna.
- Integriti demo: penghantaran/restok menolak gudang, tolak stok tidak cukup;
  selesai papan bayar dulu tidak mencaj semula; elak bayaran melebihi baki termasuk
  QR pending; tolak pemprosesan berulang; guard kawasan staf.
- PWA: app shell baharu, hanya cache namespace aplikasi, network-first untuk
  mengelakkan pengguna kekal pada UI lama semasa online.

## Verifikasi sebenar

Pelayar dalam aplikasi digunakan dengan kebenaran pengguna menggantikan Interceptor.
Chrome automation sebelum ini tidak memberi respons; tiada dakwaan verifikasi
Chrome dibuat untuk redesign ini.

### UI dan persistence

- Login Ali → dashboard → kedai → carian tiada hasil → kosongkan → Pak Long.
- Papan habis + cash + restok: resit RESIT-0006 RM60 berjaya; penempatan baharu
  aktif; rekod kekal selepas reload; stok gudang berkurang satu.
- Bayaran RM999 ditolak kerana baki RM60.
- Cash RM20 direkod: baki RM40. QR simulasi RM40 dijana, baki kekal sebelum
  pengesahan; selepas Simulasi diterima → Sahkan simulasi, baki RM0.
- Laporan bulan semasa dan sepanjang masa dipaparkan; profil dan pertukaran akaun berfungsi.
- Admin tambah Kedai Ujian Redesign: 6 → 7 kedai dalam origin ujian.
- Admin KPI Ali: sasaran RM150 / bonus RM75 disimpan.
- Admin stok: 239 → 240 dengan nota ujian; nilai kekal selepas reload.
- Admin tambah staf: kawasan kosong ditolak; selepas pilih Klang, Staf Demo QA
  berjaya ditambah.

### Responsif

- Enam skrin admin pada 360×800: ringkasan, kedai, pasukan, stok, laporan,
  tetapan; lebar kandungan 345px pada viewport 360px (15px scrollbar), tiada
  overflow seluruh halaman. Jadual scroll dalam bekasnya.
- Empat skrin staf pada 390×844: kedai, kutipan, profil, dashboard; lebar
  kandungan 375px pada viewport 390px, tiada overflow seluruh halaman.
- Butiran kedai dan dialog staf diuji pada 390px; senarai kedai diperiksa pada 360px.
- Desktop 1440×1000: login, dashboard, pasukan dan navigasi sidebar diperiksa.
- Screenshot sebenar disimpan di folder bukti berasingan daripada repo.
- Log error JavaScript daripada preview akhir: kosong.

### Regresi automatik

`bun run build`, `bun run check`, `bun test`, `git diff --check` lulus.
Lima ujian, 17 assertions:

1. Papan bayar dulu selesai menggunakan event asal; restok menjana hutang baharu.
2. Restok tanpa stok tidak mengubah mana-mana rekod.
3. Penyelesaian berulang tidak mewujudkan event kedua.
4. Bayaran separa + QR menunggu + pengesahan; lebihan dan pengesahan berulang ditolak.
5. Penghantaran luar kawasan tidak boleh mengubah stok/penempatan.

## Had dan keputusan

- Semua rekod ujian ialah data demo lokal di localhost:4320, bukan data produksi.
- Tidak ada backend, authentication sebenar, database berkongsi atau transaksi bank.
- KPI masih berdasarkan kedai dalam kawasan semasa seperti demo asal; dua staf
  berkongsi kawasan boleh mendapat kutipan kawasan yang sama.
- Had 50 audit log dalam data.js dikekalkan.
- Rekod gudang ialah baki demo + audit tindakan, bukan ledger stock_movements backend.
- Pemasangan Android/iPhone dan operasi offline penuh belum diuji.
- Tiada API key sebenar diminta atau disimpan melalui UI baharu.

## Sambungan multi-produk — 15 Oktober 2026

Keperluan produk tunggal digantikan dengan katalog multi-produk, unit masih papan.
Produk/SKU, harga dan baki gudang berasingan. Semua penghantaran disemak dahulu
sebelum menyimpan beberapa baris produk dengan shipment_ref bersama. Kutipan
boleh memilih satu event atau semua baki kedai; pengagihan disimpan per event
menggunakan collection_batch dan resit bersama. QR kekal simulasi per pecahan.
Penempatan lama mengekalkan snapshot harga; restok mengambil harga produk semasa.
Data pelayar lama tidak direset; seed baharu menyediakan Koko dan Kopi.

Bukti pelayar sebenar pada localhost:4320:

- Tambah Papan Sachet Kopi, SKU AK-KOPI-02, RM45, stok30; kekal selepas reload.
- Penghantaran 2 Koko + 3 Kopi: ringkasan RM255, dua produk dipilih, lima papan
  muncul dalam stok kedai dan sejarah dengan nama produk.
- Kopi sahaja habis + cash + restok: RM135 dikutip; Koko dua papan kekal aktif.
- Laporan ditapis Kopi: jumlah RM135 dan hanya transaksi Kopi dipaparkan.
- Koko RM120 dan Kopi RM135 ditandakan belum bayar (restok kedua-duanya).
- Semua baki kedai RM255 dibayar cash: dua pecahan berkongsi RESIT-0010;
  baki kedai menjadi RM0 dan kedua-dua produk masih mempunyai stok aktif.
- Gudang akhir UI: Koko236, Kopi21; kedua-duanya diurus berasingan.
- Butiran/pembayaran 390px dan360px serta katalog360px tiada overflow halaman.
- Log error JavaScript akhir kosong. Screenshot multi-product-* disimpan dalam
  folder bukti berasingan daripada repo.

Semakan terkini: build, syntax/aset dan diff check lulus; 10 ujian regresi,
39 assertions, termasuk penghantaran atomik, restok produk kedua, kutipan
merentas produk, SKU unik dan adjustment stok produk yang dipilih.
