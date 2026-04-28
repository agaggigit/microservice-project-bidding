# Project Bidding Service for Capstone Platform

Microservice dari sistem **Capstone Platform**. Repositori ini memuat *source code* dan dokumentasi teknis untuk layanan Project Bidding.

*Bagian dari projek Arsitektur Perangkat Lunak.*

## Susunan Tim

| Nama | NIM | Role |
| :--- | :--- | :--- |
| **Muhammad Affandi Argya Bagaskara** | 24/538984/TK/59778 | Project Manager |
| **Christian Kevin Andhika Danidaiva** | 23/513576/TK/56433 | DevOps Engineer |
| **Ramzi Alfito Rizky** | 24/540550/TK/60008 | Software Engineer |
| **Bayu Rahmat Kurnia** | 24/533736/TK/59139 | Software Engineer |
| **Moses Saidasdo Purba** | 23/523274/TK/57854 | Documentation Engineer |
| **Akio** | NIM | Test Engineer |

---

## Getting Started

Install project dependency
```bash
npm install
```

## Workflow

Dilarang melakukan *push* atau *commit* langsung ke `main`.

**1. Sinkronisasi main branch:**
```bash
git checkout main
git pull origin main
```

**2. Pindah ke branch untuk pengembangan fitur:**
```bash
git switch -c feat/[nama-fitur]  # Untuk membuat branch baru
```
or
```bash
git switch feat/[nama-fitur] # Jika branch sudah ada
```

**3. Implementasi dan commit:**
```bash
git add .
git commit -m "feat: [deskripsi fitur]"
```

**4. Push ke repositori:**
```bash
git push origin feat/[nama-fitur]
```

**5. Pull Request (PR):**
Ajukan PR ke cabang `main`. Wajib mendapatkan persetujuan (*approval*) minimal dari 1 anggota tim sebelum di-*merge*.

## Penamaan Branch
* **Fitur:** `feat/[nama-fitur]` (Ex: `feat/create-bid`)
* **Bugfix:** `bugfix/[nama-bug]` (Ex: `bugfix/fix-validation`)
* **Dokumentasi:** `docs/[nama-dokumen]` (Ex: `docs/api-spec`)

## Konvensi Commit Message
Gunakan standar [Conventional Commits](https://www.conventionalcommits.org/):
* `feat:` Penambahan fitur baru
* `fix:` Perbaikan bug
* `docs:` Pembaruan dokumentasi
* `refactor:` Restrukturisasi kode tanpa ubah fungsi
* `chore:` Penyesuaian konfigurasi atau dependensi
#### Commit early, commit often
