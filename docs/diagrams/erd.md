# Entity Relationship Diagram (ERD)

## Database Relationships

```
┌──────────────────────┐
│      MITRA           │ (Partners)
├──────────────────────┤
│ PK  mitra_id         │
│     nama_mitra       │
│     kontak_mitra     │
└──────────┬───────────┘
           │ (1:N)
           │
           ▼
┌──────────────────────┐
│      PROYEK          │ (Projects)
├──────────────────────┤
│ PK  proyek_id        │
│ FK  mitra_id         │
│     judul_proyek     │
│     deskripsi_proyek │
│     requirements     │
│     kuota_maksimal   │
│     budget_awal      │
│     tanggal_selesai  │
│     status_proyek    │
│     created_at       │
└──────────┬───────────┘
           │ (1:N)
           │
           ▼
┌──────────────────────────────┐
│         BID                  │ (Group Bids)
├──────────────────────────────┤
│ PK  bid_id                   │
│ FK  proyek_id                │
│ FK  kelompok_id              │
│ FK  pendaftar_id             │
│     status_bid               │
│     urutan_prioritas         │
│     dokumen_url              │
│     tawaran_harga            │
│     tawaran_waktu            │
│     waktu_bid                │
└────────┬──────────────────────┘
         │ (1:N)
         │
         ▼
┌──────────────────────────────┐
│    NEGOSIASI                 │ (Negotiations)
├──────────────────────────────┤
│ PK  nego_id                  │
│ FK  bid_id                   │
│     response_harga           │
│     response_waktu           │
│     role_ (Mitra/Kelompok)   │
│     created_at               │
└──────────────────────────────┘

┌──────────────────────┐
│     KELOMPOK         │ (External Reference)
├──────────────────────┤
│ PK  kelompok_id      │
│     nama_kelompok    │
└──────────────────────┘

┌──────────────────────┐
│    MAHASISWA         │ (External Reference)
├──────────────────────┤
│ PK  mahasiswa_id     │
│     nama_lengkap     │
│     nim              │
└──────────────────────┘
```

## Key Constraints & Relationships

- **MITRA → PROYEK (1:N)**: One partner has many projects (CASCADE DELETE)
- **PROYEK → BID (1:N)**: One project has many bids (CASCADE DELETE)
- **KELOMPOK → BID (1:N)**: One group submits many bids (External reference)
- **MAHASISWA → BID (1:N)**: One student submits many bids (External reference)
- **BID → NEGOSIASI (1:N)**: One bid has many negotiations (CASCADE DELETE)
- **UNIQUE (proyek_id, kelompok_id) in BID**: One group can only bid once per project
- **CHECK role_ IN ('Mitra', 'Kelompok') in NEGOSIASI**: Role validation
