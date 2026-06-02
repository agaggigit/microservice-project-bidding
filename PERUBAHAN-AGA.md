# Perubahan Integrasi Outbound (RabbitMQ)

## 1. Penambahan Dependency RabbitMQ

Untuk mendukung komunikasi *asynchronous* (Message Broker) dengan Kelompok 4 dan Kelompok 5, kita memigrasikan metode HTTP request menjadi protokol AMQP.

Dependency baru ditambahkan ke dalam sistem:

```json
"dependencies": {
  "amqplib": "^2.0.1" 
}

```

File yang berubah:

* `package.json`
* `package-lock.json`

## 2. Modul Koneksi RabbitMQ Baru

Dibuat sebuah *utility* baru sebagai "mesin utama" untuk menjaga koneksi ke server RabbitMQ dan mempublikasikan pesan (*publish message*) ke dalam antrean (*queue*).

Fungsi utama yang ditambahkan:

* `connectRabbitMQ()`: Membuka *channel* koneksi secara dinamis.
* `publishMessage(queueName, data)`: Mengonversi payload JSON menjadi `Buffer` dan melemparnya ke antrean tujuan dengan konfigurasi `{ persistent: true }`.

File yang berubah:

* `src/utils/rabbitmq.js` (File Baru)

## 3. Tracker Menggunakan RabbitMQ (Kelompok 4)

Fungsi `sendDealToTracker` dirombak total. Penggunaan `axios` untuk melakukan HTTP POST telah dihapus.

Sekarang, saat sebuah *Bid* atau *Negosiasi* mencapai status `Accepted`, data kontrak (deal) akan dilempar langsung ke antrean RabbitMQ.

Queue tujuan:

```text
tracker_deals_queue

```

File yang berubah:

* `src/utils/tracker.js`

## 4. Notification Menggunakan RabbitMQ (Kelompok 5)

Sistem *mock* notifikasi (`console.log`) telah diganti dengan *event publisher* sungguhan. Sistem akan mempublikasikan *event* ke RabbitMQ setiap kali ada perubahan status.

Queue tujuan:

```text
notification_queue

```

Tiga jenis *event* (`notification_type`) yang dikirim ke antrean:

* `BID_STATUS_UPDATE`: Dikirim saat bid di-accept/reject.
* `DEAL_CONFIRMED`: Dikirim saat negosiasi final disetujui.
* `COUNTER_OFFER`: Dikirim saat ada tawaran harga baru dari client/talent.

Format payload yang dikirim ke queue (contoh):

```json
{
  "notification_type": "BID_STATUS_UPDATE",
  "recipient_id": "1",
  "status": "Accepted",
  "project_title": "Aplikasi E-Commerce",
  "timestamp": "2026-05-19T10:30:00Z"
}

```

File yang berubah:

* `src/utils/notification.js`

## 5. Penambahan Environment Variable

Karena RabbitMQ menggunakan protokol AMQP, diperlukan URL koneksi baru di environment lokal maupun server.

Tambahkan baris berikut ke dalam file `.env`:

```env
RABBITMQ_URL=amqp://localhost:5672

```

File yang berubah:

* `.env`

## 6. Catatan Server & Deployment

* Pastikan layanan RabbitMQ sudah berjalan di lokal (menggunakan Docker atau *native install*) di port `5672` sebelum melakukan *testing* endpoint *Accept Bid* atau *Negotiating*.
* Pada saat *deployment*, DevOps perlu menyesuaikan nilai `RABBITMQ_URL` dengan alamat IP/Host dari server Message Broker yang disepakati oleh kelompok gabungan.