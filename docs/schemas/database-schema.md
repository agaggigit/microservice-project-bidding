# Database Schema - Project Bidding Service

## Overview

This document describes the actual database schema for the Project Bidding Microservice. The database uses PostgreSQL to manage projects, group bids, and negotiation records.

**Database Name:** `bidding` (or `capstone_bidding` for production)
**Database Type:** PostgreSQL 18+

---

## Enum Types

```sql
-- Status for projects: Open (accepting bids), Full (quota reached), Closed (no more bids)
CREATE TYPE status_proyek_enum AS ENUM ('Open', 'Full', 'Closed');

-- Status for bids: Queued (waiting), Pending (under review), Accepted (chosen), Rejected (not chosen)
CREATE TYPE status_bid_enum AS ENUM ('Pending', 'Accepted', 'Rejected', 'Queued');
```

---

## Tables

### 1. Mitra (Partners/Project Owners)

```sql
CREATE TABLE mitra (
    mitra_id SERIAL PRIMARY KEY,
    nama_mitra VARCHAR(255) NOT NULL,
    kontak_mitra VARCHAR(255) NOT NULL
);
```

**Purpose:** Store partner/project owner information

**Fields:**
- `mitra_id` - Partner ID (Auto-increment)
- `nama_mitra` - Partner name
- `kontak_mitra` - Contact information (email/phone)

---

### 2. Kelompok (Groups - External Reference)

```sql
CREATE TABLE kelompok (
    kelompok_id VARCHAR(50) PRIMARY KEY,
    nama_kelompok VARCHAR(255) NOT NULL
);
```

**Purpose:** Reference table for groups from Group 1 service. Only stores IDs for data integrity.

**Fields:**
- `kelompok_id` - Group ID (VARCHAR for UUID compatibility)
- `nama_kelompok` - Group name

---

### 3. Mahasiswa (Students - External Reference)

```sql
CREATE TABLE mahasiswa (
    mahasiswa_id VARCHAR(50) PRIMARY KEY,
    nama_lengkap VARCHAR(255),
    nim VARCHAR(20)
);
```

**Purpose:** Reference table for students from Group 1 service.

**Fields:**
- `mahasiswa_id` - Student ID (VARCHAR for UUID compatibility)
- `nama_lengkap` - Full name
- `nim` - Student ID number

---

### 4. Proyek (Projects)

```sql
CREATE TABLE proyek (
    proyek_id SERIAL PRIMARY KEY,
    mitra_id INT NOT NULL,
    judul_proyek VARCHAR(255) NOT NULL,
    deskripsi_proyek TEXT NOT NULL,
    requirements TEXT,
    kuota_maksimal INT NOT NULL DEFAULT 1,
    budget_awal DECIMAL(15, 2) NOT NULL,
    tanggal_selesai DATE,
    status_proyek status_proyek_enum DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mitra
      FOREIGN KEY(mitra_id) 
      REFERENCES mitra(mitra_id)
      ON DELETE CASCADE
);
```

**Purpose:** Store project information created by partners

**Fields:**
- `proyek_id` - Project ID (Auto-increment)
- `mitra_id` - Partner ID (Foreign Key)
- `judul_proyek` - Project title
- `deskripsi_proyek` - Project description
- `requirements` - Technical/business requirements
- `kuota_maksimal` - Maximum groups that can work on project
- `budget_awal` - Initial budget
- `tanggal_selesai` - Project deadline
- `status_proyek` - Status (Open/Full/Closed)
- `created_at` - Creation timestamp

---

### 5. Bid (Bids/Proposals)

```sql
CREATE TABLE bid (
    bid_id SERIAL PRIMARY KEY,
    proyek_id INT NOT NULL,
    kelompok_id VARCHAR(50),
    pendaftar_id VARCHAR(50) NOT NULL,
    status_bid status_bid_enum DEFAULT 'Queued',
    urutan_prioritas INT NOT NULL,
    dokumen_url TEXT NOT NULL,
    tawaran_harga DECIMAL(15, 2) NOT NULL,
    tawaran_waktu DATE NOT NULL,
    waktu_bid TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_proyek FOREIGN KEY(proyek_id) REFERENCES proyek(proyek_id),
    CONSTRAINT fk_kelompok FOREIGN KEY(kelompok_id) REFERENCES kelompok(kelompok_id),
    CONSTRAINT fk_pendaftar FOREIGN KEY(pendaftar_id) REFERENCES mahasiswa(mahasiswa_id),
    CONSTRAINT unique_bid_per_kelompok UNIQUE (proyek_id, kelompok_id)
);
```

**Purpose:** Store group bids/proposals for projects

**Fields:**
- `bid_id` - Bid ID (Auto-increment)
- `proyek_id` - Project ID (Foreign Key)
- `kelompok_id` - Group ID (VARCHAR, nullable for individual submissions)
- `pendaftar_id` - Student ID who submitted the bid (Foreign Key)
- `status_bid` - Bid status (Queued/Pending/Accepted/Rejected)
- `urutan_prioritas` - Priority order (1, 2, 3, etc.)
- `dokumen_url` - URL to bid proposal document
- `tawaran_harga` - Offered price
- `tawaran_waktu` - Offered completion date
- `waktu_bid` - Bid submission timestamp

**Constraints:**
- `unique_bid_per_kelompok` - One group can only bid once per project

---

### 6. Negosiasi (Negotiations)

```sql
CREATE TABLE negosiasi(
    nego_id SERIAL PRIMARY KEY,
    bid_id INT NOT NULL,
    response_harga DECIMAL(15, 2) NOT NULL,
    response_waktu DATE NOT NULL,
    role_ VARCHAR(10) NOT NULL CHECK(role_ IN ('Mitra', 'Kelompok')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bid FOREIGN KEY(bid_id) REFERENCES bid(bid_id)  
);
```

**Purpose:** Store negotiation history between partners and groups

**Fields:**
- `nego_id` - Negotiation ID (Auto-increment)
- `bid_id` - Bid ID (Foreign Key)
- `response_harga` - Counter-offered price
- `response_waktu` - Counter-offered completion date
- `role_` - Who made the counter-offer (Mitra or Kelompok)
- `created_at` - Negotiation timestamp

---

---

## Relationships

```
Mitra (1) ──→ (Many) Proyek
Kelompok (1) ──→ (Many) Bid
Mahasiswa (1) ──→ (Many) Bid
Proyek (1) ──→ (Many) Bid
Bid (1) ──→ (Many) Negosiasi
```

---

## Constraints & Rules

### Foreign Keys (Referential Integrity)
- Deleting a partner cascades delete of all their projects
- Deleting a project cascades delete of all its bids and negotiations
- Group and Student tables reference external systems (no cascade)

### Business Rules
- **One bid per group per project:** `UNIQUE (proyek_id, kelompok_id)`
- **Negotiation role validation:** `CHECK(role_ IN ('Mitra', 'Kelompok'))`
- **Project quota logic:** Auto-update project status from Open to Full when bids reach quota

---

## Sample Queries

### Get all bids for a project
```sql
SELECT * FROM bid WHERE proyek_id = $1 ORDER BY waktu_bid DESC;
```

### Get negotiation history for a bid
```sql
SELECT * FROM negosiasi WHERE bid_id = $1 ORDER BY created_at DESC;
```

### Get projects by partner
```sql
SELECT * FROM proyek WHERE mitra_id = $1 ORDER BY created_at DESC;
```

### Get bids by group
```sql
SELECT * FROM bid WHERE kelompok_id = $1 ORDER BY waktu_bid DESC;
```
