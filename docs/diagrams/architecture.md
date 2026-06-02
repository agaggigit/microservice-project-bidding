# System Architecture

## Current Implementation Status

✅ **Implemented:**
- Project Management (Full CRUD)
- Bidding Service (Create, Get with role-based filtering)
- Negotiation Service (Basic endpoints)
- PostgreSQL Database with relationships
- Header-based authentication (X-User-ID, X-User-Type)
- Docker & Docker Compose setup

⏳ **In Progress / Planned:**
- Bid acceptance/rejection workflow
- Deal finalization to Group 4
- Advanced negotiation flows

---

## Microservice Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Applications                          │
│              (Frontend, Mobile, External Services)              │
└──────────┬──────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────┐
│   Group 2 Service        │
│  (Project Bidding)       │
├──────────────────────────┤
│ - Projects               │
│ - Bidding                │
│ - Negotiation            │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│   PostgreSQL Database    │
│   (bidding)              │
└──────────────────────────┘
```

## Group 2 Service - Internal Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                   Express.js Application                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │           API Routes & Controllers Layer                │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌───────────┐ │ │
│  │  │ /api/projects  │  │ /api/bidding   │  │ /api/     │ │ │
│  │  │ (CRUD)         │  │ (POST, GET)    │  │negotiating│ │ │
│  │  └────────────────┘  └────────────────┘  └───────────┘ │ │
│  └──────────────┬───────────────────────────────────────────┘ │
│                 │                                              │
│  ┌──────────────▼───────────────────────────────────────────┐ │
│  │              Middleware Layer                            │ │
│  │  - authMiddleware (X-User-ID, X-User-Type)              │ │
│  │  - projectsValidation                                   │ │
│  │  - Express JSON parser                                  │ │
│  └──────────────┬───────────────────────────────────────────┘ │
│                 │                                              │
│  ┌──────────────▼───────────────────────────────────────────┐ │
│  │          Services & Business Logic Layer                 │ │
│  │  - projectService (validation, CRUD)                    │ │
│  │  - biddingService (quota logic, role-based filtering)  │ │
│  │  - negotiatingService (negotiation management)         │ │
│  └──────────────┬───────────────────────────────────────────┘ │
│                 │                                              │
│  ┌──────────────▼───────────────────────────────────────────┐ │
│  │         Data Access Layer (Repositories)                │ │
│  │  - projectRepository (create, read, update, delete)    │ │
│  │  - Direct pool.query() for Bid & Negotiation           │ │
│  └──────────────┬───────────────────────────────────────────┘ │
│                 │                                              │
└─────────────────┼──────────────────────────────────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │  PostgreSQL Pool   │
         │  (pg library)      │
         └────────┬───────────┘
                  │
                  ▼
         ┌────────────────────┐
         │  PostgreSQL DB     │
         │  (bidding)         │
         └────────────────────┘
```

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | v24-alpine |
| Framework | Express.js | 5.2.1+ |
| Database | PostgreSQL | 18-alpine |
| Driver | pg (node-postgres) | 8.20.0+ |
| Configuration | dotenv | 17.4.2+ |
| Development | nodemon | 3.1.14+ |
| Containerization | Docker & Compose | Latest |

## Authentication

**Header-Based (Stateless)**

```
Required Headers:
  X-User-ID: <user_id>
  X-User-Type: <'talent' or 'mitra'>
```

**Not JWT-based** - Uses simple header validation in authMiddleware
