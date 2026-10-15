# SAS EMPIRE — Inventori & Consignment

Demo interaktif dengan reka bentuk baharu A–Z untuk operasi consignment multi-produk (unit: papan).

## Jalankan preview

Bun diperlukan. Tiada dependency aplikasi tambahan.

```bash
bun run build
bun run dev
```

Buka `http://localhost:4320/`. Pilih akaun demo pada skrin login.
Untuk port lain: `PORT=4321 bun run dev`.

## Ruang kerja

**Staf:** dashboard harian → kedai + carian/penapis → butiran kedai → hantar papan /
papan habis + kutip + restok → bayaran cash/separa/QR simulasi → laporan → profil.

**Superadmin:** ringkasan operasi → kedai → staf & kawasan + KPI/bonus → produk dan
stok gudang → laporan bertempoh → tetapan demo.

Navigasi sidebar pada desktop dan navigasi bawah pada telefon. Semua dialog
menggunakan `<dialog>` native, dengan fokus papan kekunci dan label borang.

## Struktur

```text
ui-demo/src/app.ts       Sumber TypeScript untuk semua skrin dan interaksi
ui-demo/assets/app.js    Bundle browser; jana semula dengan bun run build
ui-demo/assets/data.js   Seed dan persistence localStorage sedia ada
ui-demo/assets/style.css Sistem visual dan responsive layout tanpa Tailwind CDN
ui-demo/assets/brand.svg Logo dan sumber ikon PWA
ui-demo/*.html           Entry point statik untuk setiap skrin
ui-demo/sw.js            App shell cache, network-first dengan fallback offline
scripts/serve.ts         Pelayan preview Bun
scripts/check.ts         Semakan syntax dan aset tempatan
scripts/business.test.ts Regresi stok, kutipan, caj berganda dan akses kawasan
PLAN.md / schema.md      Pelan backend dan skema; belum diimplementasi
REDESIGN.md              Skop, bukti verifikasi dan had semakan
```

Selepas edit `app.ts`, jalankan `bun run build` sebelum preview/publish. Bundle
JavaScript disertakan supaya demo boleh dihoskan secara statik.

## Semakan

```bash
bun run check
bun test
```

## Data dan bayaran

Data demo hanya disimpan pada pelayar/peranti masing-masing; tiada penyegerakan
antara pengguna. Pilihan akaun bukan authentication sebenar. QR/Billplz ialah
simulasi; pengesahan melalui butang **Simulasi diterima** tidak menghantar webhook
atau transaksi bank. Pautan WhatsApp hanya dibuka apabila diklik pengguna.

Penghantaran dan restok mengurangkan stok gudang. Mod bayar dulu mewujudkan hutang
semasa penghantaran; menandakan papan itu habis tidak mencipta caj kedua untuk
penempatan yang sama. Restok mewujudkan penempatan baharu mengikut harga semasa.

## PWA

Manifest, ikon dan service worker disediakan. Hoskan melalui HTTP localhost atau
HTTPS. Android: Chrome → menu → tambah ke skrin utama. iPhone: Safari → Share →
tambah ke skrin utama. Pemasangan peranti sebenar dan operasi offline lengkap
masih perlu disemak sebelum membuat tuntutan sokongan produksi. Font Google
menggunakan fallback sistem jika tidak tersedia.

Backend, database sebenar, login selamat dan integrasi Billplz masih kerja berasingan.

## Multi-produk

- Tambah/edit produk dengan SKU unik, harga dan stok awal berasingan di **Produk & stok**.
- Satu penghantaran boleh mengandungi beberapa produk; jumlah dikira secara langsung.
- Jika mana-mana stok tidak cukup, seluruh penghantaran ditolak sebelum mengubah data.
- Pilih penempatan produk yang habis. Kutipan dan restok hanya menjejaskan produk itu.
- **Semua baki kedai** menggabungkan kutipan; pecahan per produk/event kekal boleh diaudit.
- Laporan kutipan boleh ditapis mengikut produk; KPI kekal semua produk bulan semasa.
- Data pelayar sedia ada dikekalkan. Katalog contoh Koko/Kopi tersedia pada pelayar baharu
  atau selepas reset demo; pengguna lama boleh tambah produk melalui katalog tanpa reset.
- QR gabungan masih menghasilkan rekod simulasi berasingan per event; tiada satu bil
  gateway sebenar dijana dalam demo ini.
