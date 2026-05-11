Contoh object untuk diuji POST di postman 

create project(/api/projects):
{
    "mitra_id": 1,
    "judul_proyek": "TES AJA 2",
    "deskripsi_proyek": "Buat sistem bidding untuk proyek kampus ramzoy asoy",
    "requirements": "Node.js, Express, PostgreSQL",
    "kuota_maksimal": 3
}

create bid(/api/bidding):
{
  {
    "project_id" : 4,
    "group_id" : "KLG001",
    "student_id" : "MHS001",
    "priority" : 1,
    "document_url" : "https://dokumenKLG001/CV.pdf"
}
}

