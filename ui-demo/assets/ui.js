// ============================================================
// UI HELPERS — toast, modal, pengesahan borang (dikongsi semua halaman)
// ============================================================

function toast(msg, icon = "✓") {
  document.querySelectorAll(".toast").forEach((t) => t.remove());
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function bukaModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove("hidden");
    el.classList.add("sheet-backdrop");
  }
}

function tutupModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add("hidden");
  }
}

function tutupModalLuar(event, id) {
  if (event.target === event.currentTarget) tutupModal(id);
}

function showError(inputId, msg) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(inputId + "-err");
  if (input) input.classList.add("input-error");
  if (err) {
    err.textContent = msg;
    err.style.display = "block";
  }
}

function clearError(inputId) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(inputId + "-err");
  if (input) input.classList.remove("input-error");
  if (err) err.style.display = "none";
}

function clearAllErrors(ids) {
  ids.forEach(clearError);
}

function kosong(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

// Tab bar untuk halaman staf (mobile)
function tabbarHtml(active) {
  const tabs = [
    { id: "utama", href: "staf-dashboard.html", ic: "⌂", label: "Utama" },
    { id: "kedai", href: "staf-senarai.html", ic: "🏪", label: "Kedai" },
    { id: "laporan", href: "staf-laporan.html", ic: "📊", label: "Laporan" },
    { id: "profil", href: "staf-profil.html", ic: "👤", label: "Profil" },
  ];
  return `<nav class="tabbar">${tabs
    .map((t) => `<a href="${t.href}" class="${t.id === active ? "active" : ""}"><span class="tab-ic">${t.ic}</span>${t.label}</a>`)
    .join("")}</nav>`;
}

// Header ringkas halaman staf
function stafHeaderHtml(user, tajuk, sub) {
  return `
  <div class="hero-card mx-4 mt-4 p-5 anim-fade">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-indigo-100 text-xs font-medium">${sub || ""}</p>
        <h1 class="text-lg font-bold leading-snug mt-0.5">${tajuk}</h1>
      </div>
      ${avatarHtml(user.nama, "ok")}
    </div>
  </div>`;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
