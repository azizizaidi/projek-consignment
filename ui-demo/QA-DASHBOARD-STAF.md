# QA — Dashboard Staf SAS WARRIOR (UI Demo)

## Skop

Hanya `staf-dashboard.html`, aliran masuk ke dashboard, navigasi staf dan pemasangan aset PWA. Demo menggunakan localStorage; **bukan backend production**.

## Semakan automatik/statik

- [x] Viewport responsif ditetapkan.
- [x] Ringkasan dua kolum menggunakan `minmax(0, 1fr)` untuk mengelakkan overflow kad.
- [x] Navigasi bawah mengambil kira `safe-area-inset-bottom`.
- [x] Pautan profil mempunyai label aksesibiliti.
- [x] Halaman menggunakan `requireLogin("staf")` (sekatan *demo* sahaja).
- [x] Login demo staf menuju ke `staf-dashboard.html`.
- [x] Navigasi bersama staf mengandungi pautan Dashboard.
- [x] Service worker menggunakan cache baharu dan menyenaraikan dashboard sebagai aset app shell.
- [x] Tiada angka palsu untuk stok staf atau bank-in; kedua-duanya ditandakan belum tersedia.
- [x] KPI mengambil data daripada fungsi demo sedia ada, dengan caveat pengiraan mengikut kawasan.
- [x] Butang modul yang belum dibina dinyahaktifkan.
- [x] Tajuk `Perlu perhatian` tidak mendakwa rekod itu berlaku pada hari ini.

## Ujian browser/peranti — belum dilaksanakan

Uji dalam browser/device selepas checkout branch:

1. Chrome DevTools 360 × 800 px dan 390 × 844 px; tiada horizontal scroll, angka panjang tidak terpotong.
2. Android Chrome pada 200% text zoom dan tetapan large font; label, butang dan kad masih boleh dibaca.
3. Login sebagai ketiga-tiga staf; nama, kawasan, baki kutipan dan KPI demo berubah ikut akaun.
4. Login superadmin; tidak diubah ke halaman staf.
5. Pastikan klik `Pilih kedai untuk rekod kutipan` pergi ke senarai kedai dan pengguna boleh kembali ke Dashboard menggunakan navigasi.
6. Butang Bank-in/Hantar stok yang belum siap tidak menyimpan transaksi atau berpura-pura berjaya.
7. Uji dengan data demo yang tiada kutipan bulan semasa; `RM 0.00` dan penjelasan KPI tidak salah.
8. Refresh dan buka semula selepas PWA di-install; sahkan cache baharu tidak memaparkan versi lama.
9. Uji keyboard focus, VoiceOver/TalkBack dan sasaran sentuh bawah pada peranti dengan navigation bar.
10. Uji offline — app shell boleh dibuka selepas aset pernah dicache; tindakan backend sebenar tidak disokong.

## Batasan diketahui

- Data hanya localStorage, tiada autentikasi/autoriti sebenar.
- Stok di tangan, deposit tunai dan komisyen bertingkat belum mempunyai ledger.
- KPI sedia ada diagregat mengikut kawasan dan tidak boleh dianggap komisyen individu jika staf berkongsi kawasan.
- Demo September mungkin memaparkan KPI sifar bagi bulan semasa; ini angka demo, bukan kecacatan pembentangan.
- Tiada tangkapan skrin/ujian runtime browser dilaksanakan dalam semakan ini.

## Syarat penerimaan visual

360px dan 390px mesti lulus manual QA sebelum UI dinyatakan siap; jangan tandakan ujian sebagai lulus hanya daripada pemeriksaan HTML/CSS.
