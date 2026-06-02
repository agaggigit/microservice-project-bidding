# Perubahan Jobdesk

## 1. Kolom `skills` Project Menjadi Enum

Kolom `skills` ditambahkan ke tabel `proyek` sebagai array enum:

```sql
CREATE TYPE project_skill_enum AS ENUM (
    'Frontend',
    'Backend',
    'UI/UX',
    'Mobile',
    'Database',
    'DevOps',
    'Data Science',
    'Machine Learning',
    'Cybersecurity',
    'QA Testing'
);
```

Kolom baru:

```sql
skills project_skill_enum[] NOT NULL
```

Dengan ini, `skills` tidak lagi berupa input teks bebas, tapi harus berupa pilihan dari enum. Payload create/update project sekarang memakai format array:

```json
{
  "skills": ["Frontend", "Backend", "Database"]
}
```

File yang berubah:

- `database_schema.sql`
- `src/features/projects/services/project.service.js`
- `src/features/projects/repositories/project.repository.js`
- `src/middleware/projectsValidation.js`
- `api-test.http`

## 2. Validasi `skills` di API Project

Create dan update project sekarang memvalidasi `skills`:

- Harus berupa array.
- Tidak boleh kosong.
- Semua item harus string.
- Semua item harus termasuk dalam enum yang tersedia.
- Duplikasi skill otomatis dihapus dengan `Set`.

Jika input tidak valid, API mengembalikan error `400 Validation failed`.

## 3. Role Diubah Menjadi `talent`, `client`, dan `admin`

Auth middleware sekarang hanya menerima role:

```js
['talent', 'client', 'admin']
```

Role lama `mitra` sudah diganti menjadi `client` pada level API/RBAC.

File yang berubah:

- `src/middleware/auth.middleware.js`
- `src/features/projects/controllers/project.controller.js`
- `src/features/bidding/controllers/bidding.controller.js`
- `src/features/bidding/services/bidding.service.js`
- `src/features/bidding/routes/bidding.routes.js`
- `src/features/negotiating/controllers/negotiating.controller.js`
- `src/features/negotiating/services/negotiating.service.js`
- `api-test.http`

## 4. Aturan Akses Setelah Perubahan Role

Project:

- `client` bisa membuat project.
- `client` hanya bisa update/delete project miliknya.
- `admin` bisa update/delete project tanpa cek ownership.
- `talent` tidak bisa membuat/update/delete project.

Bidding:

- `talent` bisa membuat bid.
- `client` bisa melihat bid untuk project miliknya.
- `admin` bisa melihat semua bid.
- `client` pemilik project atau `admin` bisa accept/reject bid.

Negotiating:

- `client` dan `talent` bisa membuat negosiasi sesuai ownership.
- `admin` tidak bisa membuat negosiasi sebagai pihak project/bid.
- `role_` negosiasi tidak perlu dikirim dari body, karena otomatis diisi dari `X-User-Type`.
- Nilai `role_` sekarang memakai enum `user_role_enum`.

## 5. Enum Role Negosiasi

Ditambahkan enum:

```sql
CREATE TYPE user_role_enum AS ENUM ('talent', 'client', 'admin');
```

Kolom `role_` di tabel `negosiasi` berubah dari:

```sql
role_ VARCHAR(10) NOT NULL CHECK(role_ IN ('Mitra', 'Kelompok'))
```

menjadi:

```sql
role_ user_role_enum NOT NULL
```

## 6. Update Contoh Request

`api-test.http` sudah diperbarui:

- Header `X-User-Type: mitra` diganti menjadi `X-User-Type: client`.
- Body create/update project ditambah `skills`.
- Body create negotiation tidak lagi mengirim `role_`.

Contoh create project:

```http
POST http://localhost:3000/api/projects
Content-Type: application/json
X-User-ID: 1
X-User-Type: client

{
  "judul_proyek": "Aplikasi E-Commerce",
  "deskripsi_proyek": "Platform belanja online modern",
  "skills": ["Frontend", "Backend", "Database"],
  "requirements": "Pengalaman dengan React dan Node.js",
  "mitra_id": 1,
  "kuota_maksimal": 3,
  "status_proyek": "Open",
  "budget_awal": 5000000
}
```

## 7. Catatan Database

Perubahan enum dan kolom sudah ditulis di `database_schema.sql`.

Jika database sudah pernah dibuat sebelumnya, perubahan ini tidak otomatis masuk. Perlu migration manual, misalnya:

```sql
CREATE TYPE project_skill_enum AS ENUM (
    'Frontend',
    'Backend',
    'UI/UX',
    'Mobile',
    'Database',
    'DevOps',
    'Data Science',
    'Machine Learning',
    'Cybersecurity',
    'QA Testing'
);

CREATE TYPE user_role_enum AS ENUM ('talent', 'client', 'admin');

ALTER TABLE proyek
ADD COLUMN skills project_skill_enum[] NOT NULL DEFAULT ARRAY['Backend']::project_skill_enum[];

ALTER TABLE negosiasi
ALTER COLUMN role_ TYPE user_role_enum
USING (
  CASE
    WHEN role_ = 'Mitra' THEN 'client'::user_role_enum
    WHEN role_ = 'Kelompok' THEN 'talent'::user_role_enum
    ELSE role_::user_role_enum
  END
);
```

## 8. Verifikasi

Pengecekan sintaks JavaScript berhasil:

```bash
rg --files -g '*.js' | xargs -n1 node --check
```

Runtime server belum diverifikasi karena dependency lokal belum terinstall. Saat dicoba load app, Node mengembalikan error:

```text
Cannot find module 'express'
```
