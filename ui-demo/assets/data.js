// ============================================================
// DATA LAYER — Sistem Inventori & Consignment (demo)
// Seed data + persistence (localStorage) + helper perniagaan.
// Struktur ikut schema.md. Data demo — bukan data sebenar.
// v4: produk TUNGGAL (papan sachet koko) + KPI/bonus per staf.
// ============================================================

const SEED = {
  version: 4,
  kawasan: [
    { id: 1, nama: "Klang" },
    { id: 2, nama: "Shah Alam" },
    { id: 3, nama: "Puchong" },
  ],
  users: [
    { id: 1, nama: "Tuan Azizi", username: "superadmin", peranan: "superadmin", telefon: "012-3456789", kawasan_ids: [], kpi: null },
    { id: 2, nama: "Ali Hassan", username: "ali", peranan: "staf", telefon: "013-1112222", kawasan_ids: [1], kpi: { target: 150, bonus: 50 } },
    { id: 3, nama: "Siti Aminah", username: "siti", peranan: "staf", telefon: "014-3334444", kawasan_ids: [2], kpi: { target: 200, bonus: 120 } },
    { id: 4, nama: "Faizal Rahman", username: "faizal", peranan: "staf", telefon: "016-5556666", kawasan_ids: [3], kpi: { target: 100, bonus: 60 } },
  ],
  // PRODUK TUNGGAL — 1 papan sachet koko sahaja (tiada produk lain)
  products: [
    { id: 1, sku: "AK-KOKO-01", nama: "Papan Sachet Koko", unit: "papan", harga_papan: 60.0, stok_gudang: 240 },
  ],
  outlets: [
    { id: 1, nama_kedai: "Kedai Serbaneka Ali", nama_owner: "Ali Karim", telefon_owner: "011-2233445", kawasan_id: 1, mod_bayar_default: "bayar_kemudian", alamat: "No 12, Jalan Kasturi, Klang" },
    { id: 2, nama_kedai: "Mini Market Aisyah", nama_owner: "Aisyah Yusof", telefon_owner: "011-9988776", kawasan_id: 1, mod_bayar_default: "bayar_dulu", alamat: "Lot 5, Taman Sentosa, Klang" },
    { id: 3, nama_kedai: "Kedai Runcit Pak Long", nama_owner: "Pak Long Ismail", telefon_owner: "012-4455667", kawasan_id: 1, mod_bayar_default: "bayar_kemudian", alamat: "45, Jalan Meru, Klang" },
    { id: 4, nama_kedai: "Grocer Jaya", nama_owner: "Jaya Kumar", telefon_owner: "017-7788990", kawasan_id: 2, mod_bayar_default: "bayar_kemudian", alamat: "88, Seksyen 7, Shah Alam" },
    { id: 5, nama_kedai: "Kedai Makmur", nama_owner: "Zainab Othman", telefon_owner: "019-3321456", kawasan_id: 2, mod_bayar_default: "bayar_dulu", alamat: "21, Seksyen 19, Shah Alam" },
    { id: 6, nama_kedai: "Mydin Mini Puchong", nama_owner: "Rahim Salleh", telefon_owner: "018-6647788", kawasan_id: 3, mod_bayar_default: "bayar_kemudian", alamat: "10, Bandar Puteri, Puchong" },
  ],
  placements: [
    { id: 1, outlet_id: 1, product_id: 1, kuantiti_papan: 1, mod_bayar: "bayar_kemudian", harga_papan_unit: 60.0, status: "aktif", tarikh_hantar: "2026-09-10", tarikh_habis: null, oleh: "Ali Hassan" },
    { id: 2, outlet_id: 1, product_id: 1, kuantiti_papan: 1, mod_bayar: "bayar_kemudian", harga_papan_unit: 60.0, status: "habis", tarikh_hantar: "2026-08-20", tarikh_habis: "2026-09-09", oleh: "Ali Hassan" },
    { id: 3, outlet_id: 1, product_id: 1, kuantiti_papan: 1, mod_bayar: "bayar_kemudian", harga_papan_unit: 60.0, status: "aktif", tarikh_hantar: "2026-09-18", tarikh_habis: null, oleh: "Ali Hassan" },
    { id: 4, outlet_id: 2, product_id: 1, kuantiti_papan: 2, mod_bayar: "bayar_dulu", harga_papan_unit: 60.0, status: "aktif", tarikh_hantar: "2026-09-22", tarikh_habis: null, oleh: "Ali Hassan" },
    { id: 5, outlet_id: 3, product_id: 1, kuantiti_papan: 1, mod_bayar: "bayar_kemudian", harga_papan_unit: 60.0, status: "aktif", tarikh_hantar: "2026-09-05", tarikh_habis: null, oleh: "Ali Hassan" },
    { id: 6, outlet_id: 3, product_id: 1, kuantiti_papan: 1, mod_bayar: "bayar_kemudian", harga_papan_unit: 60.0, status: "habis", tarikh_hantar: "2026-08-15", tarikh_habis: "2026-09-04", oleh: "Ali Hassan" },
    { id: 7, outlet_id: 3, product_id: 1, kuantiti_papan: 1, mod_bayar: "bayar_kemudian", harga_papan_unit: 60.0, status: "habis", tarikh_hantar: "2026-07-20", tarikh_habis: "2026-08-14", oleh: "Ali Hassan" },
    { id: 8, outlet_id: 4, product_id: 1, kuantiti_papan: 1, mod_bayar: "bayar_kemudian", harga_papan_unit: 60.0, status: "aktif", tarikh_hantar: "2026-09-15", tarikh_habis: null, oleh: "Siti Aminah" },
    { id: 9, outlet_id: 5, product_id: 1, kuantiti_papan: 3, mod_bayar: "bayar_dulu", harga_papan_unit: 60.0, status: "aktif", tarikh_hantar: "2026-09-20", tarikh_habis: null, oleh: "Siti Aminah" },
    { id: 10, outlet_id: 6, product_id: 1, kuantiti_papan: 1, mod_bayar: "bayar_kemudian", harga_papan_unit: 60.0, status: "aktif", tarikh_hantar: "2026-09-12", tarikh_habis: null, oleh: "Faizal Rahman" },
  ],
  collection_events: [
    { id: 1, placement_id: 2, outlet_id: 1, jenis: "papan_habis", bilangan_papan: 1, jumlah: 60.0, status: "dibayar", tarikh_event: "2026-09-09" },
    { id: 2, placement_id: 4, outlet_id: 2, jenis: "bayar_dulu", bilangan_papan: 2, jumlah: 120.0, status: "dibayar", tarikh_event: "2026-09-22" },
    { id: 3, placement_id: 6, outlet_id: 3, jenis: "papan_habis", bilangan_papan: 1, jumlah: 60.0, status: "belum_bayar", tarikh_event: "2026-09-04" },
    { id: 4, placement_id: 7, outlet_id: 3, jenis: "papan_habis", bilangan_papan: 1, jumlah: 60.0, status: "dibayar", tarikh_event: "2026-08-14" },
    { id: 5, placement_id: 9, outlet_id: 5, jenis: "bayar_dulu", bilangan_papan: 3, jumlah: 180.0, status: "separa", tarikh_event: "2026-09-20" },
  ],
  payments: [
    { id: 1, collection_event_id: 1, kaedah: "cash", jumlah: 60.0, rujukan: "RESIT-0091", status: "berjaya", paid_at: "2026-09-09 15:20" },
    { id: 2, collection_event_id: 2, kaedah: "duitnow_qr", jumlah: 120.0, rujukan: "BILLPLZ-8842X", status: "berjaya", paid_at: "2026-09-22 10:05" },
    { id: 3, collection_event_id: 4, kaedah: "cash", jumlah: 60.0, rujukan: "RESIT-0077", status: "berjaya", paid_at: "2026-08-14 16:40" },
    { id: 4, collection_event_id: 5, kaedah: "duitnow_qr", jumlah: 100.0, rujukan: "BILLPLZ-9931Y", status: "berjaya", paid_at: "2026-09-20 09:12" },
    { id: 5, collection_event_id: 5, kaedah: "duitnow_qr", jumlah: 25.0, rujukan: "BILLPLZ-9932Z", status: "pending", paid_at: null },
  ],
  audit_logs: [
    { id: 1, user: "Ali Hassan", aksi: "Papan dihantar", ringkasan: "Kedai Serbaneka Ali — Papan Sachet Koko ×1", masa: "2026-09-18 09:12" },
    { id: 2, user: "Siti Aminah", aksi: "Bayaran QR dihantar", ringkasan: "Kedai Makmur — RM 180.00 (BILLPLZ-9931Y)", masa: "2026-09-20 09:12" },
    { id: 3, user: "Ali Hassan", aksi: "Papan habis + kutip", ringkasan: "Kedai Runcit Pak Long — RM 60.00 belum bayar", masa: "2026-09-04 17:30" },
    { id: 4, user: "Ali Hassan", aksi: "Bayaran direkod (cash)", ringkasan: "Kedai Serbaneka Ali — RM 60.00 (RESIT-0091)", masa: "2026-09-09 15:20" },
    { id: 5, user: "Tuan Azizi", aksi: "Daftar kedai", ringkasan: "Mydin Mini Puchong (Puchong)", masa: "2026-09-01 11:00" },
    { id: 6, user: "Ali Hassan", aksi: "Papan dihantar", ringkasan: "Mini Market Aisyah — Papan Sachet Koko ×2 (bayar dulu)", masa: "2026-09-22 10:00" },
    { id: 7, user: "Tuan Azizi", aksi: "Set KPI staf", ringkasan: "Ali Hassan — KPI RM 150.00, bonus RM 50.00", masa: "2026-09-01 11:05" },
  ],
  settings: {
    gateway: "Billplz (DuitNow QR + FPX)",
    api_key: "sk-demo-••••••••••••",
    webhook_url: "https://consignment.example.com/webhook/billplz",
    mdr_ditanggung: "supplier",
  },
};

// ---------------- Persistence ----------------
const STORAGE_KEY = "consignment_demo_v4";

function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === SEED.version) return parsed;
    }
  } catch (e) { /* rosak → seed semula */ }
  const seeded = JSON.parse(JSON.stringify(SEED));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

let DB = loadDB();

function saveDB() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DB));
}

function resetDemo() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("demo_user");
  DB = loadDB();
}

// ---------------- Helper asas ----------------
function nextId(arr) {
  return arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1;
}

function fmtRM(n) {
  return "RM " + Number(n).toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const BULAN = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];

function fmtTarikh(iso) {
  if (!iso) return "-";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${Number(d)} ${BULAN[Number(m) - 1]} ${y}`;
}

function fmtTarikhMasa(s) {
  if (!s) return "-";
  return `${fmtTarikh(s)}, ${s.slice(11, 16)}`;
}

// Masa tempatan (bukan UTC)
function hariIni() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function masaSekarang() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${hariIni()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ---------------- Lookup ----------------
function outletById(id) { return DB.outlets.find((o) => o.id === Number(id)); }
function productById(id) { return DB.products.find((p) => p.id === Number(id)); }
function userById(id) { return DB.users.find((u) => u.id === Number(id)); }
function kawasanById(id) { return DB.kawasan.find((k) => k.id === Number(id)); }
function kawasanNama(id) { const k = kawasanById(id); return k ? k.nama : "-"; }
function outletsByKawasan(kawasanId) { return DB.outlets.filter((o) => o.kawasan_id === Number(kawasanId)); }
function placementsByOutlet(outletId) { return DB.placements.filter((p) => p.outlet_id === Number(outletId)); }
function collectionEventsByOutlet(outletId) { return DB.collection_events.filter((c) => c.outlet_id === Number(outletId)); }
function paymentsForEvent(eventId) { return DB.payments.filter((p) => p.collection_event_id === Number(eventId)); }

// ---------------- Nilai terbitan (schema.md §5) ----------------
function papanAktif(outletId) {
  return placementsByOutlet(outletId)
    .filter((p) => p.status === "aktif")
    .reduce((s, p) => s + p.kuantiti_papan, 0);
}

function jumlahBerjaya(eventId) {
  return paymentsForEvent(eventId)
    .filter((p) => p.status === "berjaya")
    .reduce((s, p) => s + p.jumlah, 0);
}

function bakiEvent(eventId) {
  const ev = DB.collection_events.find((e) => e.id === Number(eventId));
  if (!ev) return 0;
  return Math.max(0, ev.jumlah - jumlahBerjaya(eventId));
}

function bakiBelumKutip(outletId) {
  return collectionEventsByOutlet(outletId).reduce((s, e) => s + bakiEvent(e.id), 0);
}

function kutipanBerjaya(outletIds, bulanPrefix) {
  return DB.payments
    .filter((p) => p.status === "berjaya")
    .filter((p) => {
      const ev = DB.collection_events.find((e) => e.id === p.collection_event_id);
      return ev && outletIds.includes(ev.outlet_id) && (!bulanPrefix || (p.paid_at || "").startsWith(bulanPrefix));
    })
    .reduce((s, p) => s + p.jumlah, 0);
}

// ---------------- KPI & BONUS (per staf) ----------------
// Peraturan: bonus HANYA jika kutipan bulan ini ≥ KPI. Tak cukup KPI = tiada bonus.
function outletIdsOfStaf(u) {
  return DB.outlets.filter((o) => u.kawasan_ids.includes(o.kawasan_id)).map((o) => o.id);
}

function capaianKpiBulan(u, bulanPrefix) {
  return kutipanBerjaya(outletIdsOfStaf(u), bulanPrefix || hariIni().slice(0, 7));
}

function statusKpi(u) {
  const kpi = u.kpi || { target: 0, bonus: 0 };
  const capaian = capaianKpiBulan(u);
  const pct = kpi.target > 0 ? Math.min(100, Math.round((capaian / kpi.target) * 100)) : 0;
  return {
    target: kpi.target,
    bonus: kpi.bonus,
    capaian,
    pct,
    layak: kpi.target > 0 && capaian >= kpi.target,
  };
}

// ---------------- Label & chip ----------------
function statusLabel(status) {
  const map = {
    aktif: "Aktif", habis: "Habis", dikembalikan: "Dikembalikan", rosak: "Rosak",
    belum_bayar: "Belum Bayar", separa: "Bayaran Separa", dibayar: "Dibayar", pending: "Menunggu QR",
    bayar_dulu: "Bayar Dulu", bayar_kemudian: "Bayar Kemudian",
    cash: "Cash", duitnow_qr: "DuitNow QR", fpx: "FPX",
  };
  return map[status] || status;
}

function statusChipTone(status) {
  const map = {
    aktif: "ok", dibayar: "ok", berjaya: "ok",
    separa: "warn", pending: "info",
    belum_bayar: "danger", rosak: "danger",
    habis: "muted", dikembalikan: "warn",
    bayar_dulu: "info", bayar_kemudian: "violet",
  };
  return map[status] || "muted";
}

function chip(label, tone) {
  return `<span class="chip chip-${tone || "muted"}">${label}</span>`;
}

function statusChip(status) { return chip(statusLabel(status), statusChipTone(status)); }
function modChip(mod) { return chip(statusLabel(mod), statusChipTone(mod)); }

function avatarHtml(nama, tone) {
  const awalan = nama.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const tones = { violet: "bg-violet-100 text-violet-700", ok: "bg-emerald-100 text-emerald-700", warn: "bg-amber-100 text-amber-700", info: "bg-blue-100 text-blue-700" };
  return `<div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${tones[tone] || tones.violet}">${awalan}</div>`;
}

// ---------------- Audit log ----------------
function logAksi(aksi, ringkasan) {
  const user = currentUser();
  DB.audit_logs.unshift({
    id: nextId(DB.audit_logs),
    user: user ? user.nama : "sistem",
    aksi,
    ringkasan,
    masa: masaSekarang(),
  });
  if (DB.audit_logs.length > 50) DB.audit_logs = DB.audit_logs.slice(0, 50);
}

// ---------------- WhatsApp / Billplz simulasi ----------------
function waLink(telefon, mesej) {
  let digits = (telefon || "").replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "6" + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(mesej)}`;
}

function billplzLink(rujukan) {
  return `https://pay.billplz.com/demo/${rujukan}`;
}

function janaRujukanBill() {
  return "BILLPLZ-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

function janaRujukanResit() {
  return "RESIT-" + String(nextId(DB.payments)).padStart(4, "0");
}

// ---------------- Sesi pengguna (demo) ----------------
function currentUser() {
  try {
    const raw = localStorage.getItem("demo_user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function setCurrentUser(userId) {
  const u = DB.users.find((x) => x.id === Number(userId));
  localStorage.setItem("demo_user", JSON.stringify(u));
  return u;
}

function logout() {
  localStorage.removeItem("demo_user");
  window.location.href = "login.html";
}

function requireLogin(role) {
  const u = currentUser();
  if (!u || (role && u.peranan !== role)) {
    window.location.href = "login.html";
    return null;
  }
  return u;
}
