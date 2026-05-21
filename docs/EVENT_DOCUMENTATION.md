# Event Documentation: Message Broker (RabbitMQ)

Dokumentasi lengkap event-event yang dipublikasikan oleh Bidding Service ke RabbitMQ untuk integrasi dengan Tracking & Notification Service.

## Konfigurasi Broker

- **Exchange: `tracker.events`** (type: topic)
- **Exchange: `notification.events`** (type: topic)
- **RabbitMQ URL:** `amqp://localhost:5672` (Local Docker)

---

## Notification Events

### 1. Bid Status Update

- **Routing Key:** `notification.bid.status.updated`
- **Trigger:** Client mengubah status bid menjadi Accepted/Rejected
- **Payload Structure:**

```json
{
  "notification_type": "BID_STATUS_UPDATE",
  "recipient_id": 5,
  "status": "Accepted",
  "project_title": "Aplikasi E-Commerce",
  "project_id": 1,
  "bid_id": 10,
  "timestamp": "2026-05-21T10:30:00.000Z"
}
```

---

### 2. Deal Confirmed

- **Routing Key:** `notification.deal.confirmed`
- **Trigger:** Client/Talent menerima (accept) negosiasi, deal final dikonfirmasi
- **Payload Structure:**

```json
{
  "notification_type": "DEAL_CONFIRMED",
  "recipient_id": 5,
  "project_title": "Aplikasi E-Commerce",
  "project_id": 1,
  "negotiation_id": 15,
  "deal_amount": 7500000,
  "timestamp": "2026-05-21T10:45:00.000Z"
}
```

---

### 3. Counter Offer

- **Routing Key:** `notification.counter.offer`
- **Trigger:** Talent/Client membuat counter offer untuk bid (negosiasi baru)
- **Payload Structure:**

```json
{
  "notification_type": "COUNTER_OFFER",
  "recipient_id": 2,
  "project_title": "Aplikasi E-Commerce",
  "project_id": 1,
  "bid_id": 10,
  "counter_offer_details": {
    "counter_price": 7500000,
    "counter_timeline": "2026-06-20",
    "offered_by": "talent"
  },
  "timestamp": "2026-05-21T10:40:00.000Z"
}
```

---

## Tracker Events

### 1. Bid Accepted → Deal Created

- **Routing Key:** `tracker.bid.accepted`
- **Trigger:** Client menerima bid (status = Accepted), deal langsung dikirim ke tracker
- **Payload Structure:**

```json
{
  "deal_id": "DEAL-1-5",
  "project_id": 1,
  "project_title": "Aplikasi E-Commerce",
  "mitra_id": 2,
  "group_id": 5,
  "bid_amount": 5000000,
  "deal_amount": 5000000,
  "status": "Accepted",
  "timeline": {
    "bid_created_at": "2026-05-20T08:15:00.000Z",
    "bid_accepted_at": "2026-05-21T10:30:00.000Z",
    "estimated_completion": 30
  }
}
```

---

### 2. Negotiation Accepted → Deal Finalized

- **Routing Key:** `tracker.negotiation.accepted`
- **Trigger:** Negosiasi diterima (status = Accepted), deal final dengan harga & waktu hasil negosiasi
- **Payload Structure:**

```json
{
  "deal_id": "DEAL-1-5",
  "project_id": 1,
  "project_title": "Aplikasi E-Commerce",
  "mitra_id": 2,
  "group_id": 5,
  "bid_amount": 5000000,
  "deal_amount": 7500000,
  "status": "Accepted",
  "timeline": {
    "bid_created_at": "2026-05-20T08:15:00.000Z",
    "bid_accepted_at": "2026-05-21T10:30:00.000Z",
    "estimated_completion": "2026-06-20"
  }
}
```

---

## Event Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  Client: PUT /bids/:id/status { status: "Accepted" }   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ├─→ Publish BID_STATUS_UPDATE
                     │   └─→ notification.bid.status.updated
                     │
                     └─→ Publish Bid Accepted Deal
                         └─→ tracker.bid.accepted
```

```
┌───────────────────────────────────────────────────────────────┐
│  Talent/Client: PUT /negotiations/:nego_id/status             │
│                 { status: "Accepted" }                         │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ├─→ Publish DEAL_CONFIRMED
                     │   └─→ notification.deal.confirmed
                     │
                     └─→ Publish Negotiation Accepted Deal
                         └─→ tracker.negotiation.accepted
```

```
┌────────────────────────────────────────────────────┐
│  Talent/Client: POST /negotiations/:bid_id         │
│                 { response_harga, response_waktu } │
└────────────────────┬───────────────────────────────┘
                     │
                     └─→ Publish COUNTER_OFFER
                         └─→ notification.counter.offer
```

---

## Field Mappings

| Field | Tipe | Sumber | Keterangan |
|-------|------|--------|-----------|
| `recipient_id` | integer | User ID dari auth | ID penerima notifikasi |
| `project_id` | integer | Database proyek | ID proyek |
| `bid_id` | integer | Database bid | ID bid |
| `nego_id` / `negotiation_id` | integer | Database negosiasi | ID negosiasi |
| `status` | string | Request body / DB | Accepted / Rejected |
| `deal_amount` | number | DB negosiasi | Harga final hasil negosiasi |
| `estimated_completion` | integer \| string | DB bid / negosiasi | Hari (int) atau Tanggal (YYYY-MM-DD) |
| `timestamp` | ISO 8601 | Server | `new Date().toISOString()` |

---

## Notes

- Semua payload JSON dikirim sebagai **Buffer** via RabbitMQ
- Setiap message memiliki flag `persistent: true` untuk durability
- Jika publish gagal, error di-log tapi endpoint tetap response 200 (graceful degradation)
- `recipient_id` adalah user yang akan menerima notifikasi (bukan yang trigger event)
