// SAS EMPIRE demo: complete interface, shared domain data in assets/data.js.
declare const DB: any;
declare function saveDB(): void;
declare function currentUser(): any;
declare function setCurrentUser(id: number): any;
declare function nextId(a: any[]): number;
declare function hariIni(): string;
declare function masaSekarang(): string;
declare function fmtRM(n: number): string;
declare function fmtTarikh(s: string): string;
declare function papanAktif(id: number): number;
declare function bakiBelumKutip(id: number): number;
declare function bakiEvent(id: number): number;
declare function kutipanBerjaya(ids: number[], month?: string | null): number;
declare function statusKpi(u: any): any;
declare function kawasanNama(id: number): string;
declare function logAksi(action: string, detail: string): void;
declare function janaRujukanResit(): string;
declare function janaRujukanBill(): string;
declare function billplzLink(ref: string): string;
declare function waLink(phone: string, message: string): string;
declare function resetDemo(): void;

const esc = (s: unknown) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const money = (n: number) => esc(fmtRM(n));
const paths: Record<string, string> = {
  home: "staf-dashboard.html",
  outlets: "staf-senarai.html",
  reports: "staf-laporan.html",
  profile: "staf-profil.html",
};
const icons: Record<string, string> = {
  home: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  outlets: '<path d="M3 10h18l-2-6H5zM5 10v10h14V10M9 20v-6h6v6"/>',
  reports: '<path d="M4 20h16M7 16V9m5 7V4m5 12v-5"/>',
  profile:
    '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  stock: '<path d="m12 3 9 5-9 5-9-5zM3 8v9l9 5 9-5V8M12 13v9M7 5.8l9 5"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  wallet: '<path d="M3 6h16v14H3zM3 6V3h14v3M15 11h6v5h-6z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  settings:
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  logout: '<path d="M10 4H4v16h6m4-13 5 5-5 5m-6-5h11"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
};
function icon(name: string) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.home}</svg>`;
}
const btn = (action: string, label: string, id: any = "", kind = "primary") =>
  `<button class="button ${kind}" data-action="${action}" data-id="${esc(id)}">${esc(label)}</button>`;
function empty(title: string, body: string, action = "") {
  return `<div class="empty">${icon("stock")}<h3>${esc(title)}</h3><p>${esc(body)}</p>${action}</div>`;
}
const labels: Record<string, string> = {
  aktif: "Aktif",
  habis: "Habis",
  dibayar: "Dibayar",
  belum_bayar: "Belum bayar",
  separa: "Separa",
  berjaya: "Berjaya",
  pending: "Menunggu",
  bayar_dulu: "Bayar dulu",
  bayar_kemudian: "Consignment",
  gagal: "Gagal",
};
const badge = (s: string) =>
  `<span class="badge ${["dibayar", "berjaya", "aktif"].includes(s) ? "good" : ["belum_bayar", "gagal"].includes(s) ? "bad" : s === "pending" || s === "separa" ? "warn" : ""}">${esc(labels[s] || s)}</span>`;
const avatar = (name: string) =>
  `<span class="avatar">${esc(
    name
      .split(" ")
      .map((x) => x[0])
      .slice(0, 2)
      .join(""),
  )}</span>`;
const outlet = (id: number) => DB.outlets.find((x: any) => x.id === Number(id));
const product = (id: number = DB.products[0]?.id) =>
  DB.products.find((p: any) => p.id === Number(id));
const productName = (id: number) =>
  product(id)?.nama || "Produk tidak tersedia";
const eventProductId = (ev: any) =>
  ev?.product_id ??
  DB.placements.find((p: any) => p.id === ev?.placement_id)?.product_id;
const eventProductName = (ev: any) => productName(eventProductId(ev));
function productBalances(id: number) {
  return DB.products
    .map((p: any) => ({
      product: p,
      qty: active(id)
        .filter((x: any) => x.product_id === p.id)
        .reduce((sum: number, x: any) => sum + x.kuantiti_papan, 0),
      due: DB.collection_events
        .filter((e: any) => e.outlet_id === id && eventProductId(e) === p.id)
        .reduce((sum: number, e: any) => sum + bakiEvent(e.id), 0),
    }))
    .filter((x: any) => x.qty > 0 || x.due > 0);
}
function productBreakdown(id: number) {
  const rows = productBalances(id);
  return rows.length
    ? '<div class="product-breakdown">' +
        rows
          .map(
            (x: any) =>
              `<div><span>${esc(x.product.nama)}</span><strong>${x.qty} papan</strong><small>Baki ${money(x.due)}</small></div>`,
          )
          .join("") +
        "</div>"
    : '<p class="muted">Belum ada produk aktif di kedai ini.</p>';
}
let productFilter = "all";
const active = (id: number) =>
  DB.placements.filter((x: any) => x.outlet_id === id && x.status === "aktif");
let user = DB.users.find((x: any) => x.id === currentUser()?.id);
const isAdmin = () => user?.peranan === "superadmin";
const accessible = () =>
  isAdmin()
    ? DB.outlets
    : DB.outlets.filter((x: any) => user?.kawasan_ids.includes(x.kawasan_id));
const permitted = (id: number) =>
  accessible().some((x: any) => x.id === Number(id));
const page = location.pathname.split("/").pop() || "login.html";
let view = isAdmin()
  ? location.hash.slice(1) || "home"
  : Object.keys(paths).find((x) => paths[x] === page) || "outlets";
let outletId = Number(new URLSearchParams(location.search).get("id"));
let filter = "all",
  query = "",
  month = hariIni().slice(0, 7),
  detailTab = "activity";
const app = document.getElementById("app")!;
let modalReturn: HTMLElement | null = null;

function announce(text: string) {
  const region = document.getElementById("notice")!;
  region.textContent = text;
  region.classList.add("visible");
  setTimeout(() => region.classList.remove("visible"), 4500);
}
function commit(action: string, detail: string) {
  logAksi(action, detail);
  saveDB();
  render();
}
function navItem(id: string, label: string, ic: string) {
  const selected = (page === "staf-kedai.html" ? "outlets" : view) === id;
  return isAdmin()
    ? `<button data-action="navigate" data-id="${id}" class="nav-item ${selected ? "selected" : ""}" ${selected ? 'aria-current="page"' : ""}>${icon(ic)}<span>${label}</span></button>`
    : `<a href="${paths[id]}" class="nav-item ${selected ? "selected" : ""}" ${selected ? 'aria-current="page"' : ""}>${icon(ic)}<span>${label}</span></a>`;
}
function shell(content: string, title: string, subtitle: string) {
  const nav = isAdmin()
    ? [
        ["home", "Ringkasan", "home"],
        ["outlets", "Kedai", "outlets"],
        ["staff", "Pasukan & KPI", "profile"],
        ["stock", "Produk & stok", "stock"],
        ["reports", "Laporan", "reports"],
        ["settings", "Tetapan", "settings"],
      ]
    : [
        ["home", "Hari ini", "home"],
        ["outlets", "Kedai saya", "outlets"],
        ["reports", "Kutipan", "reports"],
        ["profile", "Profil", "profile"],
      ];
  app.innerHTML = `<div class="workspace"><aside class="sidebar"><a class="brand" href="${isAdmin() ? "superadmin.html" : "staf-dashboard.html"}"><img class="brand-logo" src="assets/brand.svg" width="40" height="40" alt=""><span>SAS EMPIRE<small>INVENTORI & CONSIGNMENT</small></span></a><p class="nav-caption">${isAdmin() ? "RUANG PENGURUSAN" : "RUANG STAF"}</p><nav aria-label="Navigasi utama">${nav.map((x) => navItem(...(x as [string, string, string]))).join("")}</nav><div class="sidebar-bottom"><div class="demo-dot">Demo workspace</div><div class="identity">${avatar(user.nama)}<div><strong>${esc(user.nama)}</strong><small>${isAdmin() ? "Superadmin" : esc(user.kawasan_ids.map(kawasanNama).join(", "))}</small></div><button class="icon-button" data-action="logout" aria-label="Log keluar">${icon("logout")}</button></div></div></aside><div class="workspace-main"><header class="topbar"><span class="breadcrumb">Workspace <span>/</span> ${esc(title)}</span><div class="topbar-right"><span class="date">${esc(fmtTarikh(hariIni()))}</span><span class="demo-pill">DEMO</span>${avatar(user.nama)}<button class="icon-button" data-action="logout" aria-label="Tukar akaun" title="Tukar akaun">${icon("logout")}</button></div></header><main id="main" tabindex="-1"><div class="page-heading"><div><p class="eyebrow">${isAdmin() ? "PUSAT OPERASI" : esc(user.kawasan_ids.map(kawasanNama).join(" · "))}</p><h1>${esc(title)}</h1><p class="description">${esc(subtitle)}</p></div>${isAdmin() && view === "outlets" ? btn("edit-outlet", "Tambah kedai") : isAdmin() && view === "staff" ? btn("edit-staff", "Tambah staf") : ""}</div>${content}<footer class="page-footer"><span>SAS EMPIRE · Demo interaktif</span><span>Data pada pelayar ini sahaja · QR simulasi</span></footer></main><nav class="mobile-nav" aria-label="Navigasi telefon">${nav.map((x) => navItem(...(x as [string, string, string]))).join("")}</nav></div></div>`;
}
function stat(
  label: string,
  value: string,
  note: string,
  ic: string,
  tone = "",
) {
  return `<article class="metric ${tone}"><span class="metric-icon">${icon(ic)}</span><p>${esc(label)}</p><strong>${value}</strong><small>${esc(note)}</small></article>`;
}
function stats() {
  const shops = accessible(),
    ids = shops.map((x: any) => x.id);
  return `<div class="metrics">${stat("Kutipan bulan ini", money(kutipanBerjaya(ids, hariIni().slice(0, 7))), "Bayaran yang telah berjaya", "wallet")}${stat("Baki belum kutip", money(shops.reduce((s: number, o: any) => s + bakiBelumKutip(o.id), 0)), "Termasuk bayaran separa", "clock", "attention")}${stat("Papan di kedai", String(shops.reduce((s: number, o: any) => s + papanAktif(o.id), 0)), "Papan aktif di semua kedai anda", "stock")}${stat("Kedai diurus", String(shops.length), isAdmin() ? "Semua kawasan" : "Dalam kawasan ditugaskan", "outlets")}</div>`;
}
function section(title: string, sub: string, body: string, action = "") {
  return `<section class="panel"><div class="panel-heading"><div><h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}</div>${action}</div>${body}</section>`;
}
function dueList(shops: any[]) {
  const due = shops
    .filter((o) => bakiBelumKutip(o.id) > 0)
    .sort((a, b) => bakiBelumKutip(b.id) - bakiBelumKutip(a.id));
  return due.length
    ? `<div class="list">${due.map((o) => `<div class="list-row">${avatar(o.nama_owner)}<div class="grow"><strong>${esc(o.nama_kedai)}</strong><small>${esc(kawasanNama(o.kawasan_id))} · ${papanAktif(o.id)} papan aktif</small></div><div class="align-right"><strong class="danger">${money(bakiBelumKutip(o.id))}</strong>${isAdmin() ? btn("edit-outlet", "Lihat kedai", o.id, "text") : `<a class="text-link" href="staf-kedai.html?id=${o.id}">Urus kutipan →</a>`}</div></div>`).join("")}</div>`
    : empty(
        "Semua kutipan selesai",
        "Tiada baki tertunggak dalam kawasan anda.",
      );
}
function kpiCard(u: any) {
  const k = statusKpi(u);
  return `<div class="kpi-card"><div class="row"><div>${avatar(u.nama)}<strong>${esc(u.nama)}</strong></div><span class="badge ${k.layak ? "good" : "warn"}">${k.layak ? "Capai KPI" : "Belum capai"}</span></div><p class="kpi-value">${money(k.capaian)} <small>/ ${money(k.target)}</small></p><progress max="100" value="${k.pct}" aria-label="Capaian KPI ${esc(u.nama)}">${k.pct}%</progress><div class="row"><small>${k.pct}% sasaran bulan ini</small><strong>${k.layak ? "Bonus " + money(k.bonus) : "Belum layak bonus"}</strong></div>${isAdmin() ? btn("kpi", "Urus KPI & bonus", u.id, "secondary") : ""}</div>`;
}
function home() {
  const shops = accessible();
  const pending = DB.payments.filter(
    (p: any) =>
      p.status === "pending" &&
      shops.some(
        (o: any) =>
          o.id ===
          DB.collection_events.find((e: any) => e.id === p.collection_event_id)
            ?.outlet_id,
      ),
  );
  const title = isAdmin()
    ? "Gambaran operasi"
    : `Selamat bertugas, ${user.nama.split(" ")[0]}.`;
  const banner = `<section class="welcome-banner"><div><span class="banner-label">${isAdmin() ? "SEMUA KAWASAN" : "MULAKAN LAWATAN ANDA"}</span><h2>${isAdmin() ? "Setiap papan. Setiap kutipan." : "Dari kedai ke kedai, semuanya teratur."}</h2><p>${isAdmin() ? "Pantau stok, kutipan dan pasukan dalam satu ruang kerja." : "Semak baki kedai, rekod penghantaran dan selesaikan kutipan hari ini."}</p>${isAdmin() ? btn("navigate", "Lihat laporan", "reports", "light") : `<a class="button light" href="staf-senarai.html">Lihat kedai saya ${icon("arrow")}</a>`}</div><div class="banner-graphic" aria-hidden="true"><span>STOK</span><b>${shops.reduce((s: number, o: any) => s + papanAktif(o.id), 0)}</b><small>PAPAN AKTIF</small><div class="graphic-lines"></div></div></section>`;
  const activity = DB.audit_logs
    .filter((x: any) => isAdmin() || x.user === user.nama)
    .slice(0, 5);
  shell(
    banner +
      stats() +
      `<div class="two-column">${section("Perlu perhatian", "Utamakan kedai dengan baki belum dikutip.", dueList(shops))}${isAdmin() ? section("Aktiviti pasukan", "Rekod tindakan paling terkini.", activity.length ? `<ol class="activity-list">${activity.map((x: any) => `<li>${icon("clock")}<div><strong>${esc(x.aksi)}</strong><p>${esc(x.ringkasan)}</p><small>${esc(x.user)} · ${esc(x.masa)}</small></div></li>`).join("")}</ol>` : empty("Belum ada aktiviti", "Aktiviti pasukan akan dipaparkan di sini.")) : section("Sasaran anda", "KPI & bonus bulan ini.", kpiCard(user))}</div>` +
      (pending.length
        ? section(
            "Bayaran menunggu",
            `${pending.length} bayaran QR simulasi belum disahkan.`,
            paymentList(pending),
          )
        : ""),
    title,
    isAdmin()
      ? "Keadaan perniagaan anda, sepintas lalu."
      : "Ringkasan kawasan dan tugasan yang perlukan perhatian.",
  );
}
function shopCard(o: any) {
  const due = bakiBelumKutip(o.id);
  return `<article class="shop-card"><div class="row"><span class="shop-icon">${icon("outlets")}</span>${badge(o.mod_bayar_default)}</div><h2>${esc(o.nama_kedai)}</h2><p>${esc(o.nama_owner)}</p><div class="shop-location">${icon("pin")}${esc(kawasanNama(o.kawasan_id))}</div><div class="shop-numbers"><div><small>Papan aktif</small><strong>${papanAktif(o.id)} <span>papan</span></strong></div><div><small>Baki belum kutip</small><strong class="${due ? "danger" : ""}">${money(due)}</strong></div></div>${productBreakdown(o.id)}${isAdmin() ? btn("edit-outlet", "Urus maklumat kedai", o.id, "secondary") : `<a class="shop-link" href="staf-kedai.html?id=${o.id}">Buka kedai ${icon("arrow")}</a>`}</article>`;
}
function outlets() {
  shell(
    `<div class="toolbar"><label class="search">${icon("search")}<input id="shop-search" type="search" placeholder="Cari kedai atau nama owner" aria-label="Cari kedai atau owner" value="${esc(query)}"></label><div class="filters" aria-label="Penapis kedai">${[
      ["all", "Semua"],
      ["due", "Belum kutip"],
      ["active", "Ada papan"],
    ]
      .map(
        ([id, l]) =>
          `<button data-action="filter" data-id="${id}" aria-pressed="${filter === id}" class="${filter === id ? "selected" : ""}">${l}</button>`,
      )
      .join(
        "",
      )}</div></div><div class="result-line" id="result-line"></div><div class="shop-grid" id="shop-results"></div>`,
    "Kedai " + (isAdmin() ? "& kawasan" : "saya"),
    "Semua maklumat kedai, stok dan baki dalam satu pandangan.",
  );
  renderShops();
}
function renderShops() {
  const results = accessible().filter(
    (o: any) =>
      (o.nama_kedai + " " + o.nama_owner)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "all" ||
        (filter === "due" && bakiBelumKutip(o.id) > 0) ||
        (filter === "active" && papanAktif(o.id) > 0)),
  );
  document.getElementById("result-line")!.textContent =
    `${results.length} kedai dipaparkan · ${accessible().length} keseluruhan`;
  document.getElementById("shop-results")!.innerHTML = results.length
    ? results.map(shopCard).join("")
    : empty(
        "Tiada kedai dijumpai",
        "Cuba nama lain atau kosongkan penapis.",
        btn("clear-search", "Kosongkan carian", "", "secondary"),
      );
}
function paymentList(payments: any[]) {
  return payments.length
    ? `<div class="list">${payments
        .map((p) => {
          const ev = DB.collection_events.find(
            (e: any) => e.id === p.collection_event_id,
          );
          return `<div class="list-row"><span class="payment-icon">${icon("wallet")}</span><div class="grow"><strong>${esc(outlet(ev?.outlet_id)?.nama_kedai || "Kedai")}</strong><small>${esc(eventProductName(ev))} · ${esc(p.rujukan)} · ${p.kaedah === "cash" ? "Cash" : "QR simulasi"}</small><small>${p.paid_at ? esc(p.paid_at) : "Belum disahkan"}</small></div><div class="align-right"><strong>${money(p.jumlah)}</strong>${badge(p.status)}${p.status === "pending" ? btn("simulate", "Simulasi diterima", p.id, "text") + `<a class="text-link" href="${esc(waLink(outlet(ev?.outlet_id)?.telefon_owner, "Pautan DEMO sahaja, bukan bayaran sebenar: " + billplzLink(p.rujukan)))}" target="_blank" rel="noopener">Kongsi pautan demo ↗</a>` : ""}</div></div>`;
        })
        .join("")}</div>`
    : empty("Belum ada bayaran", "Bayaran yang direkod akan muncul di sini.");
}
function detail() {
  const o = outlet(outletId);
  if (!o || !permitted(outletId)) {
    shell(
      empty(
        "Kedai tidak tersedia",
        "Kedai ini tiada dalam kawasan yang ditugaskan.",
        '<a class="button secondary" href="staf-senarai.html">Kembali ke kedai</a>',
      ),
      "Akses kedai",
      "Semak kawasan yang ditugaskan.",
    );
    return;
  }
  const placements = DB.placements
    .filter((p: any) => p.outlet_id === o.id)
    .slice()
    .sort(
      (a: any, b: any) =>
        b.tarikh_hantar.localeCompare(a.tarikh_hantar) || b.id - a.id,
    );
  const events = DB.collection_events.filter((e: any) => e.outlet_id === o.id);
  const payments = DB.payments.filter((p: any) =>
    events.some((e: any) => e.id === p.collection_event_id),
  );
  const outstanding = events.filter((e: any) => bakiEvent(e.id) > 0);
  let body =
    detailTab === "payments"
      ? paymentList(payments)
      : detailTab === "stock"
        ? `<div class="list">${placements.map((p: any) => `<div class="list-row"><span class="payment-icon">${icon("stock")}</span><div class="grow"><strong>${esc(productName(p.product_id))} · ${p.kuantiti_papan} papan · ${money(p.harga_papan_unit)}/papan</strong><small>Dihantar ${esc(fmtTarikh(p.tarikh_hantar))} · ${esc(p.oleh)}</small></div>${badge(p.status)}</div>`).join("") || empty("Belum ada stok", "Rekod penghantaran pertama ke kedai ini.")}</div>`
        : `<ol class="activity-list">${placements.map((p: any) => `<li>${icon("stock")}<div><strong>${esc(productName(p.product_id))} · ${p.status === "habis" ? "Papan habis" : "Penempatan papan"} · ${p.kuantiti_papan} papan</strong><p>${esc(fmtTarikh(p.tarikh_hantar))} · ${esc(labels[p.mod_bayar])}</p><small>${esc(p.oleh)}${p.tarikh_habis ? " · Habis " + esc(fmtTarikh(p.tarikh_habis)) : ""}</small></div>${badge(p.status)}</li>`).join("") || "<li>Belum ada sejarah penempatan.</li>"}</ol>`;
  shell(
    `<a class="back-link" href="staf-senarai.html">← Semua kedai</a><section class="store-header"><span class="store-symbol">${icon("outlets")}</span><div><span class="eyebrow">${esc(kawasanNama(o.kawasan_id))}</span><h2>${esc(o.nama_kedai)}</h2><p>${esc(o.nama_owner)} · ${esc(o.telefon_owner)}</p><p>${esc(o.alamat)}</p></div>${badge(o.mod_bayar_default)}</section><div class="detail-layout"><div><div class="metrics compact">${stat("Papan aktif", String(papanAktif(o.id)), "Masih berada di kedai", "stock")}${stat("Baki belum kutip", money(bakiBelumKutip(o.id)), bakiBelumKutip(o.id) > 0 ? "Bayaran belum selesai" : "Semua bayaran selesai", "wallet", "attention")}</div>${section("Stok mengikut produk", "Baki stok dan bayaran di kedai ini.", productBreakdown(o.id))}<section class="panel"><div class="detail-tabs" role="group" aria-label="Maklumat kedai">${[
      ["activity", "Sejarah"],
      ["stock", "Penempatan"],
      ["payments", "Bayaran"],
    ]
      .map(
        ([id, l]) =>
          `<button data-action="detail-tab" data-id="${id}" aria-pressed="${detailTab === id}" class="${detailTab === id ? "selected" : ""}">${l}</button>`,
      )
      .join(
        "",
      )}</div>${body}</section></div><aside class="action-panel"><span class="eyebrow">TINDAKAN KEDAI</span><h2>Rekod lawatan</h2><p>Pilih tindakan mengikut keadaan stok di kedai.</p><button class="action-feature" data-action="finish" ${active(o.id).length ? "" : "disabled"}>${icon("check")}<strong>Papan habis & kutip</strong><span>Rekod bayaran dan restok sekali gus</span>${icon("arrow")}</button>${btn("send", "Hantar papan baharu", o.id, "secondary")}${btn("pay", "Rekod bayaran", o.id, "secondary")}<div class="action-note">${icon("clock")}<span>${outstanding.length} tanggungjawab bayaran belum selesai.</span></div><a class="text-link" href="${esc(waLink(o.telefon_owner, "Assalamualaikum, saya ingin semak stok papan di " + o.nama_kedai))}" target="_blank" rel="noopener">Hubungi owner di WhatsApp ↗</a></aside></div>`,
    "Butiran kedai",
    "Rekod setiap penghantaran, kutipan dan lawatan.",
  );
}
function reports() {
  const ids = accessible().map((o: any) => o.id);
  const events = DB.collection_events.filter(
    (e: any) =>
      ids.includes(e.outlet_id) &&
      (productFilter === "all" || eventProductId(e) === Number(productFilter)),
  );
  const payments = DB.payments.filter(
    (p: any) =>
      events.some((e: any) => e.id === p.collection_event_id) &&
      (!month || (p.paid_at || "").startsWith(month)),
  );
  const successful = payments.filter((p: any) => p.status === "berjaya");
  const cash = successful
      .filter((p: any) => p.kaedah === "cash")
      .reduce((s: number, p: any) => s + p.jumlah, 0),
    online = successful
      .filter((p: any) => p.kaedah !== "cash")
      .reduce((s: number, p: any) => s + p.jumlah, 0);
  const filtered = events.filter(
    (e: any) =>
      (!month || e.tarikh_event.startsWith(month)) &&
      (filter === "all" || e.status === filter),
  );
  shell(
    `<div class="toolbar"><label class="month-field">Tempoh laporan <input id="report-month" type="month" value="${esc(month)}" aria-label="Bulan laporan"></label><label class="month-field">Produk <select id="report-product" aria-label="Produk laporan"><option value="all">Semua produk</option>${DB.products.map((p: any) => `<option value="${p.id}" ${productFilter === String(p.id) ? "selected" : ""}>${esc(p.nama)}</option>`).join("")}</select></label>${btn("all-months", "Sepanjang masa", "", "secondary")}</div><div class="metrics three">${stat("Kutipan berjaya", money(cash + online), month ? "Dalam bulan dipilih" : "Sepanjang masa", "wallet")}${stat("Cash", money(cash), "Bayaran tunai direkod", "check")}${stat("QR / FPX", money(online), "Bayaran online simulasi berjaya", "reports")}</div><div class="two-column">${section(
      "Prestasi & bonus",
      "KPI semua produk, bulan semasa.",
      isAdmin()
        ? `<div class="kpi-grid">${DB.users
            .filter((u: any) => u.peranan === "staf")
            .map(kpiCard)
            .join("")}</div>`
        : kpiCard(user),
    )}${section("Baki perlu dikutip", "Semua produk · baki semasa merentas semua tempoh.", dueList(accessible()))}</div>${section(
      "Daftar bayaran",
      "Tanggungjawab bayaran mengikut tarikh event.",
      `<div class="filters report-filters">${[
        ["all", "Semua"],
        ["belum_bayar", "Belum bayar"],
        ["separa", "Separa"],
        ["dibayar", "Dibayar"],
      ]
        .map(
          ([id, l]) =>
            `<button data-action="filter" data-id="${id}" aria-pressed="${filter === id}" class="${filter === id ? "selected" : ""}">${l}</button>`,
        )
        .join(
          "",
        )}</div><div class="table-wrap"><table><thead><tr><th>Kedai / Tarikh</th><th>Jenis</th><th>Jumlah</th><th>Baki</th><th>Status</th></tr></thead><tbody>${
        filtered
          .slice()
          .sort(
            (a: any, b: any) =>
              b.tarikh_event.localeCompare(a.tarikh_event) || b.id - a.id,
          )
          .map(
            (e: any) =>
              `<tr><td><strong>${esc(outlet(e.outlet_id)?.nama_kedai)}</strong><small>${esc(eventProductName(e))} · ${esc(fmtTarikh(e.tarikh_event))}</small></td><td>${esc(e.jenis === "bayar_dulu" ? "Bayar dulu" : "Papan habis")}</td><td>${money(e.jumlah)}</td><td>${money(bakiEvent(e.id))}</td><td>${badge(e.status)}</td></tr>`,
          )
          .join("") ||
        '<tr><td colspan="5">Tiada rekod untuk tempoh dan penapis ini.</td></tr>'
      }</tbody></table></div>`,
    )}${section("Sejarah transaksi", "Bayaran mengikut tempoh dipilih.", paymentList(payments.slice().reverse()))}`,
    "Laporan kutipan",
    "Semak aliran bayaran, baki kedai dan prestasi pasukan.",
  );
}
function profile() {
  shell(
    `<div class="profile-layout"><section class="profile-card">${avatar(user.nama)}<h2>${esc(user.nama)}</h2><p>Staf kawasan</p>${badge("aktif")}<dl><dt>Username</dt><dd>@${esc(user.username)}</dd><dt>Telefon</dt><dd>${esc(user.telefon)}</dd><dt>Kawasan</dt><dd>${esc(user.kawasan_ids.map(kawasanNama).join(", "))}</dd></dl>${btn("logout", "Log keluar", "", "secondary")}</section><div>${section("Sasaran bulanan", "Bonus hanya layak selepas KPI dicapai.", kpiCard(user))}${section("Tentang workspace", "Anda sedang menggunakan versi demo.", `<div class="info-box"><p>Data demo disimpan pada pelayar ini sahaja. Akaun dan bayaran QR adalah simulasi.</p><p>Reset akan memadam perubahan demo pada pelayar ini dan mengembalikan data asal.</p>${btn("reset", "Reset data demo", "", "danger-button")}</div>`)}</div></div>`,
    "Profil saya",
    "Maklumat akaun, kawasan dan sasaran kerja anda.",
  );
}
function staff() {
  shell(
    `<div class="staff-grid">${DB.users
      .filter((u: any) => u.peranan === "staf")
      .map(
        (u: any) =>
          `<section class="panel staff-card"><div class="row">${avatar(u.nama)}${badge("aktif")}</div><h2>${esc(u.nama)}</h2><p>@${esc(u.username)} · ${esc(u.telefon)}</p><div class="area-tags">${u.kawasan_ids.map((id: number) => `<span class="badge">${esc(kawasanNama(id))}</span>`).join("") || '<span class="badge">Belum ditugaskan</span>'}</div>${kpiCard(u)}${btn("edit-staff", "Edit maklumat & kawasan", u.id, "secondary")}</section>`,
      )
      .join(
        "",
      )}</div>${section("Kawasan operasi", "Satu staf boleh ditugaskan ke beberapa kawasan.", `<div class="area-grid">${DB.kawasan.map((k: any) => `<div class="area-card">${icon("pin")}<strong>${esc(k.nama)}</strong><small>${DB.outlets.filter((o: any) => o.kawasan_id === k.id).length} kedai · ${DB.users.filter((u: any) => u.kawasan_ids.includes(k.id)).length} staf</small></div>`).join("")}</div>`, btn("area", "Tambah kawasan", "", "secondary"))}`,
    "Pasukan & KPI",
    "Susun penugasan kawasan dan sasaran setiap staf.",
  );
}
function stock() {
  const totalStock = DB.products.reduce(
    (sum: number, p: any) => sum + p.stok_gudang,
    0,
  );
  shell(
    `<section class="stock-hero"><div><span class="eyebrow">KATALOG MULTI-PRODUK</span><h2>Setiap produk, stok tersendiri.</h2><p>Urus SKU, harga dan baki gudang untuk semua produk. Unit: papan.</p></div>${btn("product", "Tambah produk")}</section><div class="metrics three">${stat("Produk berdaftar", String(DB.products.length), "Semua SKU dalam katalog", "stock")}${stat("Jumlah stok gudang", String(totalStock), "Papan merentas semua produk", "stock")}${stat("Papan di kedai", String(DB.placements.filter((p: any) => p.status === "aktif").reduce((sum: number, p: any) => sum + p.kuantiti_papan, 0)), "Merentas semua kawasan", "outlets")}</div><div class="product-grid">${DB.products.map((p: any) => `<section class="panel product-card"><div class="row"><span class="shop-icon">${icon("stock")}</span><span class="badge">${esc(p.sku)}</span></div><h2>${esc(p.nama)}</h2><p>${money(p.harga_papan)} / papan</p><div class="shop-numbers"><div><small>Stok gudang</small><strong>${p.stok_gudang} <span>papan</span></strong></div><div><small>Aktif di kedai</small><strong>${DB.placements.filter((x: any) => x.product_id === p.id && x.status === "aktif").reduce((sum: number, x: any) => sum + x.kuantiti_papan, 0)} <span>papan</span></strong></div></div><div class="product-actions">${btn("product", "Edit produk", p.id, "secondary")}${btn("adjust-stock", "Rekod stok", p.id, "secondary")}</div></section>`).join("") || empty("Tiada produk lagi", "Tambah produk pertama untuk memulakan penghantaran.")}</div>`,
    "Produk & stok gudang",
    "Harga dan stok setiap produk diurus berasingan.",
  );
}
function settings() {
  shell(
    `<div class="two-column">${section("Kaedah bayaran", "Saluran kutipan perniagaan.", `<div class="list"><div class="list-row">${icon("wallet")}<div class="grow"><strong>Cash</strong><small>Nombor resit untuk setiap rekod</small></div>${badge("aktif")}</div><div class="list-row">${icon("reports")}<div class="grow"><strong>Billplz · DuitNow QR / FPX</strong><small>Simulasi sahaja dalam demo ini</small></div><span class="badge warn">DEMO</span></div></div><div class="info-box">Yuran gateway ditanggung oleh supplier. Demo ini tidak menghantar transaksi sebenar.</div>`)}${section("Maklumat integrasi", "Konfigurasi contoh untuk demonstrasi.", `<dl class="definition-list"><dt>Gateway</dt><dd>Billplz</dd><dt>Status</dt><dd>Belum disambung ke backend</dd><dt>Webhook contoh</dt><dd>${esc(DB.settings.webhook_url)}</dd></dl><div class="info-box">Jangan masukkan API key sebenar ke demo pelayar. Integrasi sebenar memerlukan backend.</div>`)}</div>${section("Data workspace", "Kawalan data demo pada pelayar ini.", `<div class="row settings-reset"><div><h3>Mulakan semula demo</h3><p>Buang perubahan setempat dan pulihkan data asal.</p></div>${btn("reset", "Reset data demo", "", "danger-button")}</div>`)}`,
    "Tetapan workspace",
    "Maklumat pembayaran dan kawalan versi demo.",
  );
}
function login() {
  app.innerHTML = `<main class="login-layout" id="main" tabindex="-1"><section class="login-story"><a class="brand" href="login.html"><img class="brand-logo" src="assets/brand.svg" width="40" height="40" alt=""><span>SAS EMPIRE<small>INVENTORI & CONSIGNMENT</small></span></a><div class="login-story-main"><span class="banner-label">RUANG KERJA PERNIAGAAN ANDA</span><h1>Stok teratur.<br>Kutipan lancar.<br><em>Pasukan seiring.</em></h1><p>Satu ruang untuk mengurus setiap papan, lawatan kedai dan kutipan — di mana sahaja anda bertugas.</p><div class="workflow-preview"><div>${icon("stock")}<span>Hantar</span></div><span>→</span><div>${icon("outlets")}<span>Pantau</span></div><span>→</span><div>${icon("wallet")}<span>Kutip</span></div><span>→</span><div>${icon("check")}<span>Restok</span></div></div></div><small>SAS EMPIRE · Sistem inventori & consignment</small></section><section class="login-accounts"><div class="login-inner"><span class="eyebrow">SELAMAT DATANG</span><h2>Masuk ke workspace.</h2><p>Pilih akaun demo untuk meneroka ruang kerja anda.</p><div class="login-role"><span>AKAUN DEMO</span><span class="demo-pill">TIADA KATA LALUAN</span></div>${DB.users.map((u: any) => `<button class="account-choice" data-action="login" data-id="${u.id}">${avatar(u.nama)}<span class="grow"><strong>${esc(u.nama)}</strong><small>${u.peranan === "superadmin" ? "Superadmin · semua kawasan" : "Staf · " + esc(u.kawasan_ids.map(kawasanNama).join(", "))}</small></span>${icon("arrow")}</button>`).join("")}<div class="login-note">${icon("settings")}<p><strong>Ruang selamat untuk mencuba.</strong>Data disimpan pada pelayar ini sahaja. Pembayaran QR ialah simulasi.</p></div></div></section></main>`;
}
function render() {
  user = DB.users.find((x: any) => x.id === currentUser()?.id);
  if (page === "login.html" || page === "index.html") {
    login();
    return;
  }
  if (!user) {
    location.replace("login.html");
    return;
  }
  if (page === "superadmin.html" && !isAdmin()) {
    location.replace(paths.home);
    return;
  }
  if (page !== "superadmin.html" && isAdmin()) {
    location.replace("superadmin.html");
    return;
  }
  if (page === "staf-kedai.html") {
    detail();
    return;
  }
  (
    ({ home, outlets, reports, profile, staff, stock, settings })[view] || home
  )();
}

// Accessible native dialogs, shared by every workflow.
function field(
  label: string,
  name: string,
  value: any = "",
  type = "text",
  extra = "",
) {
  return `<label class="field">${esc(label)}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
}
function select(label: string, name: string, options: any[], value: any) {
  return `<label class="field">${esc(label)}<select name="${name}">${options.map(([id, l]) => `<option value="${esc(id)}" ${String(id) === String(value) ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>`;
}
function openDialog(
  action: string,
  title: string,
  sub: string,
  content: string,
  id: any = "",
  submit = "Simpan rekod",
) {
  modalReturn = document.activeElement as HTMLElement;
  const dialog = document.getElementById("dialog") as HTMLDialogElement;
  dialog.innerHTML = `<form id="workflow-form" data-form="${action}" data-id="${esc(id)}"><header class="dialog-heading"><div><span class="eyebrow">${esc(sub)}</span><h2 id="dialog-title">${esc(title)}</h2></div><button type="button" data-action="close" class="icon-button" aria-label="Tutup dialog">${icon("close")}</button></header><div class="dialog-body">${content}<p class="form-error" id="form-error" role="alert"></p></div><footer class="dialog-footer"><button type="button" class="button secondary" data-action="close">Batal</button><button type="submit" class="button primary">${esc(submit)}</button></footer></form>`;
  dialog.showModal();
}
function closeDialog() {
  (document.getElementById("dialog") as HTMLDialogElement).close();
  modalReturn?.focus();
}
function showForm(action: string, id: number) {
  if (
    [
      "edit-outlet",
      "edit-staff",
      "kpi",
      "area",
      "product",
      "adjust-stock",
      "reset",
    ].includes(action) &&
    !isAdmin() &&
    action !== "reset"
  )
    return;
  if (["send", "finish", "pay"].includes(action) && !permitted(outletId))
    return;
  if (action === "edit-outlet") {
    const o = outlet(id) || {};
    openDialog(
      action,
      id ? "Maklumat kedai" : "Tambah kedai",
      "PENGURUSAN KEDAI",
      field(
        "Nama kedai",
        "name",
        o.nama_kedai,
        "text",
        'required maxlength="100"',
      ) +
        field(
          "Nama owner",
          "owner",
          o.nama_owner,
          "text",
          'required maxlength="100"',
        ) +
        field("Telefon WhatsApp", "phone", o.telefon_owner, "tel", "required") +
        field("Alamat kedai", "address", o.alamat, "text", "required") +
        select(
          "Kawasan",
          "area",
          DB.kawasan.map((k: any) => [k.id, k.nama]),
          o.kawasan_id,
        ) +
        select(
          "Mod bayaran",
          "mode",
          [
            ["bayar_kemudian", "Consignment · bayar bila habis"],
            ["bayar_dulu", "Bayar dulu · masa penghantaran"],
          ],
          o.mod_bayar_default,
        ),
      id,
    );
  }
  if (action === "edit-staff") {
    const u = DB.users.find((u: any) => u.id === id) || {};
    openDialog(
      action,
      id ? "Edit staf" : "Tambah staf",
      "PASUKAN & KAWASAN",
      field("Nama penuh", "name", u.nama, "text", "required") +
        field(
          "Username",
          "username",
          u.username,
          "text",
          'required pattern="[A-Za-z0-9_.-]+"',
        ) +
        field("Telefon", "phone", u.telefon, "tel", "required") +
        `<fieldset><legend>Kawasan ditugaskan</legend>${DB.kawasan.map((k: any) => `<label class="check-field"><input type="checkbox" name="areas" value="${k.id}" ${u.kawasan_ids?.includes(k.id) ? "checked" : ""}>${esc(k.nama)}</label>`).join("")}</fieldset>`,
      id,
    );
  }
  if (action === "kpi") {
    const u = DB.users.find((u: any) => u.id === id);
    openDialog(
      action,
      "KPI & bonus staf",
      u.nama,
      field(
        "Sasaran kutipan bulanan (RM)",
        "target",
        u.kpi?.target || 0,
        "number",
        'min="0.01" step="0.01" required',
      ) +
        field(
          "Bonus apabila capai KPI (RM)",
          "bonus",
          u.kpi?.bonus || 0,
          "number",
          'min="0" step="0.01" required',
        ) +
        '<div class="info-box">Bonus hanya layak jika kutipan bulan semasa mencapai sasaran.</div>',
      id,
    );
  }
  if (action === "area")
    openDialog(
      action,
      "Tambah kawasan",
      "KAWASAN OPERASI",
      field("Nama kawasan", "name", "", "text", 'required maxlength="80"'),
    );
  if (action === "product") {
    const p = id ? product(id) : {};
    if (!p) return;
    openDialog(
      action,
      id ? "Edit produk" : "Tambah produk",
      "KATALOG PRODUK",
      field(
        "Nama produk",
        "name",
        p.nama || "",
        "text",
        'required maxlength="100"',
      ) +
        field(
          "SKU unik",
          "sku",
          p.sku || "",
          "text",
          'required maxlength="40"',
        ) +
        field(
          "Harga per papan (RM)",
          "price",
          p.harga_papan ?? "",
          "number",
          'min="0.01" step="0.01" required',
        ) +
        (!id
          ? field(
              "Stok awal gudang (papan)",
              "stock",
              0,
              "number",
              'min="0" step="1" required',
            )
          : "") +
        '<div class="info-box">Harga baharu digunakan pada penghantaran seterusnya. Harga penempatan lama kekal.</div>',
      id,
    );
  }
  if (action === "adjust-stock") {
    const p = product(id);
    if (!p) return;
    openDialog(
      action,
      "Kemaskini stok gudang",
      p.nama,
      `<div class="info-box">${esc(p.sku)} · Baki semasa: <strong>${p.stok_gudang} papan</strong></div>` +
        select(
          "Jenis perubahan",
          "mode",
          [
            ["add", "Tambah stok"],
            ["set", "Tetapkan baki sebenar"],
          ],
          "add",
        ) +
        field(
          "Bilangan papan",
          "qty",
          1,
          "number",
          'min="0" step="1" required',
        ) +
        field("Sebab / nota", "note", "", "text", 'required maxlength="200"'),
      p.id,
    );
  }
  if (action === "send") {
    if (!DB.products.length) {
      announce("Belum ada produk. Minta superadmin tambah produk dahulu.");
      return;
    }
    const rows = DB.products
      .map(
        (p: any) =>
          `<div class="shipment-row"><div><strong>${esc(p.nama)}</strong><small>${esc(p.sku)} · ${money(p.harga_papan)}/papan · Stok ${p.stok_gudang}</small></div>${field("Bilangan " + p.nama, "qty_" + p.id, DB.products.length === 1 ? 1 : 0, "number", `min="0" max="${p.stok_gudang}" step="1" required`)}</div>`,
      )
      .join("");
    openDialog(
      action,
      "Hantar produk ke kedai",
      outlet(outletId).nama_kedai,
      '<div class="info-box">Isi kuantiti produk yang mahu dihantar. Biarkan 0 untuk produk yang tidak dipilih.</div>' +
        rows +
        '<div id="shipment-summary" class="payment-summary"></div>' +
        select(
          "Mod bayaran",
          "mode",
          [
            ["bayar_kemudian", "Consignment · bayar bila habis"],
            ["bayar_dulu", "Bayar dulu · hutang serta-merta"],
          ],
          outlet(outletId).mod_bayar_default,
        ),
      outletId,
      "Sahkan penghantaran",
    );
    updateShipmentSummary();
  }
  if (action === "finish") {
    const p = active(outletId);
    if (!p.length) {
      announce("Tiada papan aktif untuk ditandakan habis.");
      return;
    }
    openDialog(
      action,
      "Papan habis & kutip",
      outlet(outletId).nama_kedai,
      `<div class="step-strip"><span class="selected">1 · Papan habis</span><span>2 · Bayaran</span><span>3 · Restok</span></div>` +
        select(
          "Pilih penempatan yang habis",
          "placement",
          p.map((x: any) => [
            x.id,
            `${productName(x.product_id)} · ${x.kuantiti_papan} papan · ${fmtTarikh(x.tarikh_hantar)} · ${fmtRM(x.kuantiti_papan * x.harga_papan_unit)}`,
          ]),
          p[0].id,
        ) +
        `<div id="finish-summary"></div>` +
        select(
          "Kaedah kutipan",
          "method",
          [
            ["cash", "Cash · bayar sekarang"],
            ["qr", "QR Billplz · simulasi"],
            ["later", "Belum bayar · rekod hutang"],
          ],
          "cash",
        ) +
        field("Nombor resit (cash)", "receipt", janaRujukanResit()) +
        `<label class="check-field restock-check"><input name="restock" type="checkbox" checked>Restok produk dan bilangan papan yang sama selepas ini</label><p class="muted">Penempatan bayar dulu yang telah dibayar tidak dicaj semula.</p>`,
      outletId,
      "Sahkan lawatan",
    );
    updateFinishSummary();
  }
  if (action === "pay") {
    const events = DB.collection_events.filter(
      (e: any) => e.outlet_id === outletId && bakiEvent(e.id) > 0,
    );
    if (!events.length) {
      announce("Semua tanggungjawab bayaran kedai ini sudah selesai.");
      return;
    }
    openDialog(
      action,
      "Rekod bayaran",
      outlet(outletId).nama_kedai,
      select(
        "Tanggungjawab bayaran",
        "event",
        [
          ...(events.length > 1
            ? [["all", "Semua baki kedai · " + events.length + " rekod"]]
            : []),
          ...events.map((e: any) => [
            e.id,
            `${eventProductName(e)} · ${fmtTarikh(e.tarikh_event)} · Baki ${fmtRM(bakiEvent(e.id))}`,
          ]),
        ],
        events.length > 1 ? "all" : events[0].id,
      ) +
        field(
          "Jumlah bayaran (RM)",
          "amount",
          events.length > 1
            ? events.reduce(
                (sum: number, e: any) => sum + availableBalance(e.id),
                0,
              )
            : availableBalance(events[0].id),
          "number",
          'min="0.01" step="0.01" required',
        ) +
        select(
          "Kaedah bayaran",
          "method",
          [
            ["cash", "Cash"],
            ["qr", "QR Billplz · simulasi"],
          ],
          "cash",
        ) +
        field("Nombor resit (cash)", "receipt", janaRujukanResit()) +
        '<p class="muted">Untuk semua baki, jumlah diagihkan kepada rekod paling lama dahulu. Pecahan produk disimpan berasingan.</p>',
      outletId,
      "Simpan bayaran",
    );
  }
  if (action === "simulate") {
    const p = DB.payments.find((x: any) => x.id === id),
      e = DB.collection_events.find(
        (x: any) => x.id === p?.collection_event_id,
      );
    if (!p || !permitted(e?.outlet_id)) return;
    openDialog(
      action,
      "Simulasi bayaran diterima",
      "QR DEMO",
      `<div class="payment-summary"><span>Jumlah</span><strong>${money(p.jumlah)}</strong><p>${esc(p.rujukan)}</p></div><div class="info-box">Ini hanya mengesahkan rekod demo pada pelayar. Tiada transaksi bank atau webhook sebenar dihantar.</div>`,
      id,
      "Sahkan simulasi",
    );
  }
  if (action === "reset")
    openDialog(
      action,
      "Reset data demo?",
      "DATA PELAYAR",
      `<div class="info-box">Semua perubahan demo pada pelayar ini akan dibuang. Stok, kedai, staf dan pembayaran dipulihkan kepada data asal. Anda akan dilog keluar.</div>`,
      "",
      "Ya, reset demo",
    );
}
function availableBalance(id: number) {
  return Math.max(
    0,
    Math.round((bakiEvent(id) - pendingAmount(id)) * 100) / 100,
  );
}
function updateShipmentSummary() {
  const f = document.getElementById("workflow-form") as HTMLFormElement;
  if (f?.dataset.form !== "send") return;
  const rows = DB.products.map((p: any) => ({
    p,
    qty: Number(
      (f.elements.namedItem("qty_" + p.id) as HTMLInputElement)?.value || 0,
    ),
  }));
  const total = rows.reduce(
    (sum: number, r: any) =>
      sum + (Number.isFinite(r.qty) ? r.qty : 0) * r.p.harga_papan,
    0,
  );
  document.getElementById("shipment-summary")!.innerHTML =
    `<span>Jumlah nilai penghantaran</span><strong>${money(total)}</strong><small>${rows.filter((r: any) => r.qty > 0).length} produk dipilih</small>`;
}
function updateFinishSummary() {
  const f = document.getElementById("workflow-form") as HTMLFormElement;
  if (f?.dataset.form !== "finish") return;
  const p = DB.placements.find(
    (x: any) =>
      x.id ===
      Number((f.elements.namedItem("placement") as HTMLSelectElement).value),
  );
  const ev = DB.collection_events.find((e: any) => e.placement_id === p.id);
  const amount = ev ? bakiEvent(ev.id) : p.kuantiti_papan * p.harga_papan_unit;
  document.getElementById("finish-summary")!.innerHTML =
    `<div class="payment-summary"><span>Baki kutipan penempatan ini</span><strong>${money(amount)}</strong><small>${p.mod_bayar === "bayar_dulu" ? "Bayaran terdahulu diambil kira" : "Harga mengikut rekod penghantaran"}</small></div>`;
}
function eventStatus(ev: any) {
  const paid = DB.payments
    .filter(
      (p: any) => p.collection_event_id === ev.id && p.status === "berjaya",
    )
    .reduce((s: number, p: any) => s + p.jumlah, 0);
  ev.status =
    paid >= ev.jumlah - 0.001 ? "dibayar" : paid > 0 ? "separa" : "belum_bayar";
}
function addPlacement(
  o: any,
  qty: number,
  mode: string,
  productId = DB.products[0]?.id,
  shipmentRef = "",
) {
  const selected = product(productId);
  if (!selected) throw new Error("Produk tidak tersedia");
  const p = {
    id: nextId(DB.placements),
    outlet_id: o.id,
    product_id: selected.id,
    kuantiti_papan: qty,
    mod_bayar: mode,
    harga_papan_unit: selected.harga_papan,
    status: "aktif",
    tarikh_hantar: hariIni(),
    tarikh_habis: null,
    oleh: user.nama,
    shipment_ref: shipmentRef,
  };
  DB.placements.push(p);
  selected.stok_gudang -= qty;
  if (mode === "bayar_dulu") addEvent(p, "bayar_dulu");
  return p;
}
function addEvent(p: any, kind: string) {
  const ev = {
    id: nextId(DB.collection_events),
    placement_id: p.id,
    product_id: p.product_id,
    outlet_id: p.outlet_id,
    jenis: kind,
    bilangan_papan: p.kuantiti_papan,
    jumlah: p.kuantiti_papan * p.harga_papan_unit,
    status: "belum_bayar",
    tarikh_event: hariIni(),
  };
  DB.collection_events.push(ev);
  return ev;
}
function addPayment(ev: any, amount: number, method: string, receipt: string) {
  if (amount <= 0) return;
  const p = {
    id: nextId(DB.payments),
    collection_event_id: ev.id,
    kaedah: method === "cash" ? "cash" : "duitnow_qr",
    jumlah: amount,
    rujukan:
      method === "cash" ? receipt || janaRujukanResit() : janaRujukanBill(),
    status: method === "cash" ? "berjaya" : "pending",
    paid_at: method === "cash" ? masaSekarang() : null,
  };
  DB.payments.push(p);
  eventStatus(ev);
  return p;
}
function pendingAmount(id: number) {
  return DB.payments
    .filter((p: any) => p.collection_event_id === id && p.status === "pending")
    .reduce((s: number, p: any) => s + p.jumlah, 0);
}
function submitForm(f: HTMLFormElement) {
  const data = new FormData(f),
    val = (n: string) => String(data.get(n) || "").trim(),
    num = (n: string) => Number(val(n)),
    action = f.dataset.form!,
    id = Number(f.dataset.id);
  const fail = (msg: string) => {
    document.getElementById("form-error")!.textContent = msg;
  };
  let message = "Rekod berjaya disimpan.";
  let log = "Kemaskini rekod";
  let detail = "";
  if (
    [
      "edit-outlet",
      "edit-staff",
      "kpi",
      "area",
      "product",
      "adjust-stock",
    ].includes(action) &&
    !isAdmin()
  )
    return fail("Akses superadmin diperlukan.");
  if (["send", "finish", "pay"].includes(action) && !permitted(outletId))
    return fail("Kedai ini tidak tersedia untuk akaun anda.");
  if (action === "edit-outlet") {
    const o = {
      nama_kedai: val("name"),
      nama_owner: val("owner"),
      telefon_owner: val("phone"),
      alamat: val("address"),
      kawasan_id: num("area"),
      mod_bayar_default: val("mode"),
    };
    if (!o.nama_kedai || !o.nama_owner || !o.telefon_owner || !o.alamat)
      return fail("Lengkapkan semua maklumat kedai.");
    id
      ? Object.assign(outlet(id), o)
      : DB.outlets.push({ id: nextId(DB.outlets), ...o });
    log = id ? "Edit kedai" : "Daftar kedai";
    detail = o.nama_kedai;
  }
  if (action === "edit-staff") {
    const areas = data.getAll("areas").map(Number);
    if (!areas.length) return fail("Pilih sekurang-kurangnya satu kawasan.");
    if (
      DB.users.some(
        (u: any) =>
          u.id !== id &&
          u.username.toLowerCase() === val("username").toLowerCase(),
      )
    )
      return fail("Username ini sudah digunakan.");
    const u = {
      nama: val("name"),
      username: val("username"),
      telefon: val("phone"),
      kawasan_ids: areas,
    };
    if (!u.nama || !u.username || !u.telefon)
      return fail("Lengkapkan maklumat staf.");
    id
      ? Object.assign(
          DB.users.find((x: any) => x.id === id),
          u,
        )
      : DB.users.push({
          id: nextId(DB.users),
          peranan: "staf",
          kpi: { target: 0, bonus: 0 },
          ...u,
        });
    log = id ? "Edit staf" : "Daftar staf";
    detail = u.nama;
  }
  if (action === "kpi") {
    if (num("target") <= 0 || num("bonus") < 0)
      return fail("Sasaran mesti positif dan bonus tidak boleh negatif.");
    const u = DB.users.find((u: any) => u.id === id);
    u.kpi = { target: num("target"), bonus: num("bonus") };
    log = "Set KPI staf";
    detail = `${u.nama} · Sasaran ${fmtRM(num("target"))}`;
  }
  if (action === "area") {
    if (!val("name")) return fail("Nama kawasan diperlukan.");
    if (
      DB.kawasan.some(
        (k: any) => k.nama.toLowerCase() === val("name").toLowerCase(),
      )
    )
      return fail("Kawasan ini sudah wujud.");
    DB.kawasan.push({ id: nextId(DB.kawasan), nama: val("name") });
    log = "Tambah kawasan";
    detail = val("name");
  }
  if (action === "product") {
    const name = val("name"),
      sku = val("sku").toUpperCase(),
      price = num("price");
    if (!name || !sku || !Number.isFinite(price) || price <= 0)
      return fail("Lengkapkan nama, SKU dan harga positif.");
    if (
      DB.products.some((p: any) => p.id !== id && p.sku.toUpperCase() === sku)
    )
      return fail("SKU ini sudah digunakan. Gunakan SKU yang unik.");
    if (id) {
      const p = product(id);
      if (!p) return fail("Produk tidak tersedia.");
      Object.assign(p, { nama: name, sku, harga_papan: price });
    } else {
      if (!Number.isInteger(num("stock")) || num("stock") < 0)
        return fail("Stok awal mesti nombor bulat tidak negatif.");
      DB.products.push({
        id: nextId(DB.products),
        nama: name,
        sku,
        harga_papan: price,
        stok_gudang: num("stock"),
        unit: "papan",
      });
    }
    log = id ? "Edit produk" : "Tambah produk";
    detail = name + " · " + sku;
  }
  if (action === "adjust-stock") {
    const p = product(id);
    if (!p) return fail("Produk tidak tersedia.");
    if (!Number.isInteger(num("qty")) || num("qty") < 0 || !val("note"))
      return fail("Masukkan bilangan bulat dan sebab perubahan.");
    const old = p.stok_gudang;
    p.stok_gudang = val("mode") === "add" ? old + num("qty") : num("qty");
    log = "Kemaskini stok gudang";
    detail = `${p.nama} · ${old} → ${p.stok_gudang} papan · ${val("note")}`;
  }
  if (action === "send") {
    const rows = DB.products.map((p: any) => ({
      p,
      qty: data.has("qty_" + p.id)
        ? num("qty_" + p.id)
        : p.id === (num("product") || DB.products[0]?.id)
          ? num("qty")
          : 0,
    }));
    if (
      rows.some((r: any) => !Number.isInteger(r.qty) || r.qty < 0) ||
      !rows.some((r: any) => r.qty > 0)
    )
      return fail(
        "Pilih sekurang-kurangnya satu produk dengan bilangan bulat positif.",
      );
    if (!["bayar_dulu", "bayar_kemudian"].includes(val("mode")))
      return fail("Mod bayaran tidak sah.");
    const shortage = rows.find((r: any) => r.qty > r.p.stok_gudang);
    if (shortage)
      return fail("Stok gudang " + shortage.p.nama + " tidak mencukupi.");
    const shipmentRef = "HANTAR-" + nextId(DB.placements);
    const selected = rows.filter((r: any) => r.qty > 0);
    selected.forEach((r: any) =>
      addPlacement(outlet(outletId), r.qty, val("mode"), r.p.id, shipmentRef),
    );
    log = "Produk dihantar";
    detail =
      outlet(outletId).nama_kedai +
      " · " +
      selected.map((r: any) => r.p.nama + " ×" + r.qty).join(", ");
    message = "Penghantaran " + selected.length + " produk berjaya direkod.";
  }
  if (action === "finish") {
    const p = DB.placements.find(
      (p: any) =>
        p.id === num("placement") &&
        p.outlet_id === outletId &&
        p.status === "aktif",
    );
    if (!p) return fail("Penempatan ini tidak lagi aktif.");
    const restockProduct = product(p.product_id);
    if (
      data.has("restock") &&
      (!restockProduct || p.kuantiti_papan > restockProduct.stok_gudang)
    )
      return fail("Stok gudang tidak mencukupi untuk restok.");
    let ev = DB.collection_events.find((e: any) => e.placement_id === p.id);
    if (ev && pendingAmount(ev.id) > 0 && val("method") !== "later")
      return fail(
        "Penempatan ini ada bayaran QR menunggu. Sahkan simulasi dahulu atau pilih belum bayar.",
      );
    p.status = "habis";
    p.tarikh_habis = hariIni();
    ev = ev || addEvent(p, "papan_habis");
    if (val("method") !== "later")
      addPayment(ev, bakiEvent(ev.id), val("method"), val("receipt"));
    if (data.has("restock"))
      addPlacement(
        outlet(outletId),
        p.kuantiti_papan,
        p.mod_bayar,
        p.product_id,
      );
    log = "Papan habis + kutip" + (data.has("restock") ? " + restok" : "");
    detail = `${outlet(outletId).nama_kedai} · ${productName(p.product_id)} ×${p.kuantiti_papan}`;
    message =
      "Lawatan direkod" + (data.has("restock") ? " dan restok selesai." : ".");
  }
  if (action === "pay") {
    const selected = DB.collection_events
      .filter(
        (e: any) =>
          e.outlet_id === outletId &&
          (val("event") === "all" || e.id === num("event")) &&
          bakiEvent(e.id) > 0,
      )
      .sort(
        (a: any, b: any) =>
          a.tarikh_event.localeCompare(b.tarikh_event) || a.id - b.id,
      );
    const amount = num("amount"),
      available = selected.reduce(
        (sum: number, e: any) => sum + availableBalance(e.id),
        0,
      );
    if (!selected.length || !Number.isFinite(amount) || amount <= 0)
      return fail("Pilih tanggungjawab dan jumlah bayaran yang sah.");
    if (amount > available + 0.001)
      return fail(
        `Jumlah melebihi baki yang boleh direkod ${fmtRM(available)}. Bayaran QR menunggu turut diambil kira.`,
      );
    let remaining = Math.round(amount * 100);
    const receipt = val("receipt") || janaRujukanResit(),
      batch = "KUTIP-" + nextId(DB.payments);
    for (const e of selected) {
      const allocated = Math.min(
        remaining,
        Math.round(availableBalance(e.id) * 100),
      );
      if (allocated > 0) {
        const p = addPayment(e, allocated / 100, val("method"), receipt);
        p.collection_batch = batch;
        remaining -= allocated;
      }
      if (!remaining) break;
    }
    log =
      val("method") === "cash"
        ? "Bayaran cash direkod"
        : "Bayaran QR simulasi dijana";
    detail =
      outlet(outletId).nama_kedai + " · " + fmtRM(amount) + " · " + batch;
    message =
      val("method") === "cash"
        ? "Bayaran cash dan pecahan produk disimpan."
        : "QR simulasi dijana. Sahkan setiap pecahan melalui Simulasi diterima.";
  }
  if (action === "simulate") {
    const p = DB.payments.find(
        (p: any) => p.id === id && p.status === "pending",
      ),
      ev = DB.collection_events.find(
        (e: any) => e.id === p?.collection_event_id,
      );
    if (!p || !permitted(ev?.outlet_id))
      return fail("Bayaran ini tidak tersedia.");
    if (p.jumlah > bakiEvent(ev.id) + 0.001)
      return fail("Jumlah QR melebihi baki semasa.");
    p.status = "berjaya";
    p.paid_at = masaSekarang();
    eventStatus(ev);
    log = "Simulasi QR diterima";
    detail = p.rujukan;
    message = "Bayaran QR demo disahkan.";
  }
  if (action === "reset") {
    resetDemo();
    location.href = "login.html";
    return;
  }
  closeDialog();
  commit(log, detail);
  announce(message);
}

document.addEventListener("click", (event) => {
  const el = (event.target as HTMLElement).closest<HTMLElement>(
    "[data-action]",
  );
  if (!el) return;
  const action = el.dataset.action!,
    id = el.dataset.id || "";
  if (action === "login") {
    user = setCurrentUser(Number(id));
    logAksi("Log masuk", user.nama);
    saveDB();
    location.href = isAdmin() ? "superadmin.html" : paths.home;
    return;
  }
  if (action === "logout") {
    localStorage.removeItem("demo_user");
    location.href = "login.html";
    return;
  }
  if (action === "navigate") {
    view = id;
    filter = "all";
    query = "";
    location.hash = id;
    render();
    return;
  }
  if (action === "filter") {
    filter = id;
    if (view === "outlets") {
      outlets();
      document
        .querySelector<HTMLElement>(`[data-action="filter"][data-id="${id}"]`)
        ?.focus();
    } else reports();
    return;
  }
  if (action === "clear-search") {
    query = "";
    filter = "all";
    outlets();
    document.getElementById("shop-search")?.focus();
    return;
  }
  if (action === "detail-tab") {
    detailTab = id;
    detail();
    return;
  }
  if (action === "all-months") {
    month = "";
    reports();
    return;
  }
  if (action === "close") {
    closeDialog();
    return;
  }
  showForm(action, Number(id));
});
document.addEventListener("input", (e) => {
  if ((e.target as HTMLInputElement).name?.startsWith("qty_"))
    updateShipmentSummary();
  if ((e.target as HTMLElement).id === "shop-search") {
    query = (e.target as HTMLInputElement).value;
    renderShops();
  }
});
document.addEventListener("change", (e) => {
  const el = e.target as HTMLInputElement;
  if (el.id === "report-month") {
    month = el.value;
    reports();
  }
  if (el.name === "placement") updateFinishSummary();
  if (el.id === "report-product") {
    productFilter = el.value;
    reports();
  }
  if (el.name === "event") {
    const amount =
      el.value === "all"
        ? DB.collection_events
            .filter((e: any) => e.outlet_id === outletId)
            .reduce((sum: number, e: any) => sum + availableBalance(e.id), 0)
        : availableBalance(Number(el.value));
    (el.form!.elements.namedItem("amount") as HTMLInputElement).value =
      String(amount);
  }
});
document.addEventListener("submit", (e) => {
  const f = e.target as HTMLFormElement;
  if (f.id === "workflow-form") {
    e.preventDefault();
    submitForm(f);
  }
});
window.addEventListener("hashchange", () => {
  if (isAdmin()) {
    const next = location.hash.slice(1) || "home";
    if (
      ["home", "outlets", "staff", "stock", "reports", "settings"].includes(
        next,
      )
    ) {
      view = next;
      render();
    }
  }
});
if ("serviceWorker" in navigator)
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("sw.js").catch(() => {}),
  );
render();
