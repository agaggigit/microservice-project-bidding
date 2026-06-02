1. docker compose up --build
2. cek tabel:
   docker exec -it microservice-project-bidding-db-1 psql -U postgres -d bidding -c '\dt'
3. kalau udah ada, masukin beberapa instance dulu:
   docker exec -it microservice-project-bidding-db-1 psql -U postgres -d bidding -c "INSERT INTO mitra (nama_mitra, kontak_mitra) VALUES
   ('PT Maju Bersama', 'maju@example.com'),
   ('CV Teknologi Nusantara', 'teknusa@example.com'),
   ('PT Solusi Digital', 'solusi@example.com');"

docker exec -it microservice-project-bidding-db-1 psql -U postgres -d bidding -c "
INSERT INTO kelompok (kelompok_id, nama_kelompok) VALUES
('KLP-001', 'Kelompok Alpha'),
('KLP-002', 'Kelompok Beta'),
('KLP-003', 'Kelompok Gamma');
"
docker exec -it microservice-project-bidding-db-1 psql -U postgres -d bidding -c "
INSERT INTO mahasiswa (mahasiswa_id, nama_lengkap, nim) VALUES
('MHS-001', 'Budi Santoso', '2021001001'),
('MHS-002', 'Siti Rahayu', '2021001002'),
('MHS-003', 'Ahmad Fauzi', '2021001003'),
('MHS-004', 'Dewi Lestari', '2021001004'),
('MHS-005', 'Rizky Pratama', '2021001005');
" 4. Coba post projets dulu

5. cek endpoint" dari projects

6. Coba bid dan endpoint"nya

7. Coba nego dan endpoint"nya
