# Skema Pangkalan Data — Sistem Inventori + Consignment

**Tarikh:** 2026-09-27 • **Status:** dilampirkan kepada PLAN.md (Fasa 0)
**Pelaksanaan:** SQLite dulu → PostgreSQL (SQLAlchemy + Alembic; skema sama)

---

## 1. Ringkasan entiti

`users` • `kawasan` • `user_kawasan` • `outlets` • `products` • `stock_movements` •
`placements` • `collection_events` • `payments` • `gateway_events` • `audit_logs`

## 2. Entiti terperinci

### users
| Medan | Jenis | Nota |
|---|---|---|
| id | PK | |
| nama | text | |
| username | text, unique | login |
| password_hash | text | bcrypt |
| peranan | enum | `superadmin` \| `staf` |
| telefon | text | |
| kpi_target | decimal, nullable | **kutipan bulanan yang perlu dicapai** (boleh berbeza antara staf) |
| kpi_bonus | decimal, nullable | **bonus jika capai KPI** — tak cukup KPI = tiada bonus |
| aktif | bool | lalai true |
| created_at | datetime | |

### kawasan
| Medan | Jenis | Nota |
|---|---|---|
| id | PK | |
| nama | text, unique | contoh: "Klang", "Shah Alam" |
| nota | text, nullable | |

### user_kawasan (staf ↔ kawasan, many-to-many)
| Medan | Jenis | Nota |
|---|---|---|
| user_id | FK → users | |
| kawasan_id | FK → kawasan | |

### outlets
| Medan | Jenis | Nota |
|---|---|---|
| id | PK | |
| nama_kedai | text | |
| nama_owner | text | |
| telefon_owner | text | untuk WhatsApp pautan bayar |
| alamat | text | |
| kawasan_id | FK → kawasan | menentukan kedai mana staf nampak |
| mod_bayar_default | enum | `bayar_dulu` \| `bayar_kemudian` |
| harga_khas_papan | decimal, nullable | override harga produk (andaian #1) |
| aktif | bool | |
| created_at | datetime | |

### products
| Medan | Jenis | Nota |
|---|---|---|
| id | PK | |
| sku | text, unique | |
| nama | text | **Produk tunggal: "Papan Sachet Koko"** (tiada produk lain) |
| unit | text | sentiasa `papan` |
| harga_papan | decimal | harga yang kedai bayar per papan |
| stok_min_gudang | int | amaran stok rendah |
| aktif | bool | |
| created_at | datetime | |

### stock_movements (pergerakan stok **gudang**)
| Medan | Jenis | Nota |
|---|---|---|
| id | PK | |
| product_id | FK → products | |
| jenis | enum | `masuk` \| `keluar_ke_kedai` \| `pulangan` \| `rosak` \| `adjustment` |
| kuantiti | int | tanda positif ikut jenis |
| rujukan_id | int, nullable | id placements bila `keluar_ke_kedai` |
| nota | text | wajib untuk `adjustment`/`rosak` (sebab) |
| oleh_user_id | FK → users | |
| created_at | datetime | |

### placements (penempatan papan ke kedai)
| Medan | Jenis | Nota |
|---|---|---|
| id | PK | |
| outlet_id | FK → outlets | |
| product_id | FK → products | |
| kuantiti_papan | int | biasanya 1 untuk "hantar 1 papan" |
| mod_bayar | enum | `bayar_dulu` \| `bayar_kemudian` |
| harga_papan_unit | decimal | **snapshot** harga pada masa hantar |
| status | enum | `aktif` \| `habis` \| `dikembalikan` \| `rosak` |
| tarikh_hantar | date | |
| tarikh_habis | date, nullable | bila tandakan habis |
| oleh_user_id | FK → users | staf yang hantar |
| created_at | datetime | |

### collection_events (tanggungjawab bayaran yang terhasil)
| Medan | Jenis | Nota |
|---|---|---|
| id | PK | |
| placement_id | FK → placements | |
| outlet_id | FK → outlets | redundansi untuk laporan mudah |
| jenis | enum | `bayar_dulu` (terhasil masa hantar) \| `papan_habis` (terhasil bila papan habis) |
| bilangan_papan | int | |
| jumlah | decimal | bilangan_papan × harga_papan_unit |
| status | enum | `belum_bayar` \| `separa` \| `dibayar` |
| tarikh_event | date | tarikh hantar / tarikh habis |
| oleh_user_id | FK → users | |
| created_at | datetime | |

### payments (bayaran terhadap collection_events)
| Medan | Jenis | Nota |
|---|---|---|
| id | PK | |
| collection_event_id | FK → collection_events | |
| kaedah | enum | `cash` \| `duitnow_qr` \| `fpx` |
| jumlah | decimal | boleh kurang dari jumlah event (bayaran separa) |
| rujukan | text | `bill_id` Billplz ATAU nombor resit cash |
| status | enum | `pending` \| `berjaya` \| `gagal` |
| paid_at | datetime, nullable | |
| direkod_oleh | FK → users | staf/superadmin; `sistem` bila webhook |
| created_at | datetime | |

### gateway_events (log mentah webhook Billplz)
| Medan | Jenis | Nota |
|---|---|---|
| id | PK | |
| provider | text | `billplz` |
| bill_id | text | |
| event_type | text | |
| payload_json | text | simpan mentah untuk audit |
| signature_valid | bool | pengesahan tandatangan webhook |
| processed | bool | idempoten — event sama tak diproses dua kali |
| created_at | datetime | |

### audit_logs
| Medan | Jenis | Nota |
|---|---|---|
| id | PK | |
| user_id | FK → users | |
| aksi | text | contoh: "tandakan_habis", "rekod_bayaran" |
| entiti / entiti_id | text / int | sasaran tindakan |
| perubahan_json | text | ringkasan perubahan |
| created_at | datetime | |

## 3. Hubungan (ER ringkas)

```
users ──< user_kawasan >── kawasan ──< outlets ──< placements >── products
                                │                    │
                                │                    ├──< collection_events ──< payments
                                │                    │
                                └────────────────────┴── (outlet_id juga pada collection_events)

products ──< stock_movements        billplz webhook ──> gateway_events ──> payments (auto-sah)
semua tindakan ──> audit_logs
```

## 4. Enum & status

| Enum | Nilai | Peralihan status |
|---|---|---|
| placements.status | `aktif` → `habis` (papan habis, kutipan terhasil) → kekal; `dikembalikan` / `rosak` dari `aktif` sahaja |
| collection_events.status | `belum_bayar` → `separa` (jumlah payments berjaya < jumlah) → `dibayar` (≥ jumlah) |
| payments.status | `pending` (pautan Billplz dijana) → `berjaya` / `gagal` (webhook atau rekod manual) |
| mod_bayar | `bayar_dulu` \| `bayar_kemudian` |

## 5. Peraturan perniagaan (nilai terbitan)

- **Status semasa kedai** = placements berstatus `aktif` (papan aktif) + Σ collection_events berstatus ≠ `dibayar` (baki belum kutip).
- **Restok** = placements baharu (biasanya dalam transaksi sama dengan kutipan `papan_habis` — UI "kutip + restok").
- **Jumlah kutipan** = bilangan_papan × harga_papan_unit (snapshot); harga khas outlet digunakan pada masa penempatan jika ada.
- **Mod `bayar_dulu`**: collection_event `bayar_dulu` terhasil serentak dengan placements (hutang serta-merta sehingga dibayar).
- **Mod `bayar_kemudian`**: collection_event `papan_habis` terhasil hanya bila placements ditandakan `habis`.
- **Stok gudang** = Σ stock_movements; `keluar_ke_kedai` wajib dirujukkan kepada placements.
- **Idempoten webhook:** satu `bill_id` + event_type hanya memproses sekali (semarak `processed` pada gateway_events).

## 6. Nota pelaksanaan

1. Semua harga disimpan sebagai decimal(10,2) — jangan guna float.
2. Snapshot harga pada `placements.harga_papan_unit` — perubahan harga produk tidak menjejaskan kutipan lama.
3. Medan `outlets.harga_khas_papan` nullable (andaian #1 PLAN.md — boleh dibuang jika Tuan mahu harga tetap sahaja).
4. Penugasan staf ikut `kawasan` (andaian #2 PLAN.md — boleh tukar ke penugasan terus per kedai jika perlu).
5. Migrasi SQLite → PostgreSQL: elak ciri SQLite-sahaja (contoh: guna `server_default` yang standard).
