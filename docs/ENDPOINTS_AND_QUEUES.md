# Kelompok 3 — Bidding Service: Routes & Events

## Base URL (via Nexus Gateway)

```
http://localhost/api/bidding/...
```

Internal container: `http://svc-bidding:3000`

---

## Routes

### Projects

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/projects` | Lihat semua proyek |
| GET | `/projects/:id` | Detail proyek by ID |
| POST | `/projects` | Buat proyek baru |
| PUT | `/projects/:id` | Update proyek |
| DELETE | `/projects/:id` | Hapus proyek |

### Bidding

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/bids` | Lihat semua bids |
| GET | `/bids/:id` | Detail bid by ID |
| POST | `/bids` | Submit bid ke proyek |
| PUT | `/bids/:id/status` | Update status bid |

### Negotiating

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/negotiations` | Lihat semua negosiasi |
| GET | `/negotiations/:bid_id` | Negosiasi untuk bid tertentu |
| POST | `/negotiations/:bid_id` | Buat negosiasi baru |
| DELETE | `/negotiations` | Hapus negosiasi |
| PUT | `/negotiations/:nego_id/status` | Update status negosiasi |

---

## Events yang Di-publish ke RabbitMQ

### Exchange: `tracker.events` (type: topic)

Routing key format: `tracker.{event_type_lowercase_dot_separated}`

| Event Name | Routing Key | Trigger |
|------------|-------------|---------|
| BID_ACCEPTED | `tracker.bid.accepted` | Bid diterima client |
| NEGOTIATION_ACCEPTED | `tracker.negotiation.accepted` | Negosiasi final disetujui |

### Exchange: `notification.events` (type: topic)

Routing key format: `notification.{event_type_lowercase_dot_separated}`

| Event Name | Routing Key | Trigger |
|------------|-------------|---------|
| BID_STATUS_UPDATE | `notification.bid.status.updated` | Status bid berubah (accept/reject) |
| DEAL_CONFIRMED | `notification.deal.confirmed` | Deal/kontrak dikonfirmasi |
| COUNTER_OFFER | `notification.counter.offer` | Ada counter offer harga/timeline |
