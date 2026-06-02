# Setup Guide

## Prerequisites

- Docker & Docker Compose (recommended for local development)
- Git
- Node.js (v24+ if running locally without Docker)

## Local Development Setup (with Docker)

### 1. Clone Repository

```bash
git clone https://github.com/agaggigit/microservice-project-bidding.git
cd apl-development
```

### 2. Start Docker Services

```bash
# Start development environment with hot reload
docker compose watch
```

This will:
- Start Node.js application on port `3000`
- Start PostgreSQL database on port `5433`
- Enable hot-reload for changes to `/src` folder

### 3. Load Database Schema

Once containers are running, load the schema:

```bash
docker compose exec app psql -U postgres -d bidding -f database_schema.sql
```

Or manually:

```bash
# Connect to database
docker compose exec db psql -U postgres -d bidding

# Then paste contents of database_schema.sql
```

### 4. Verify Setup

```bash
# Check API is running
curl http://localhost:3000

# Expected output: "Halo ini layanan bidding"
```

---

## Local Development Setup (without Docker)

### 1. Prerequisites

- Node.js v24+
- PostgreSQL v18+ running locally
- npm or yarn

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Database

```bash
creatdb bidding
```

### 4. Load Schema

```bash
psql -U postgres -d bidding -f database_schema.sql
```

### 5. Configure Environment

Create `.env` file:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/bidding
```

### 6. Start Server

```bash
npm run dev
```

---

## Stopping Development

```bash
# With Docker Compose
docker compose down

# Local server
Ctrl+C in terminal
```

## Database Verification

### Check Connection

```bash
# From host machine
psql -U postgres -h localhost -p 5433 -d bidding

# Inside container
docker compose exec db psql -U postgres -d bidding
```

### List Tables

```sql
-- Inside psql
\dt

-- Should show: mitra, proyek, bid, negosiasi, kelompok, mahasiswa
```

### Check Enums

```sql
SELECT typname FROM pg_type WHERE typtype = 'e';
```

## Development Workflow

### Project Structure

```
src/
├── app.js                          # Express app setup
├── server.js                       # Server entry point
├── config/
│   └── db.js                       # Database connection
├── features/
│   ├── projects/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── routes/
│   ├── bidding/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── routes/
│   └── negotiating/
│       ├── controllers/
│       ├── services/
│       └── routes/
├── middleware/
│   ├── auth.middleware.js          # Header-based auth
│   └── projectsValidation.js       # Project validation
├── utils/
│   └── response.js                 # Response formatting
└── helper_function/
    └── functions.js                # Utility functions
```

### Installing New Packages

**With Docker:**
```bash
docker compose exec app npm install <package-name>
```

**Without Docker:**
```bash
npm install <package-name>
```

### Useful npm Scripts

```bash
# Development with auto-reload
npm run dev

# Production start
npm start
```

## Troubleshooting

### Database Connection Failed

```bash
# Check if database is running
docker compose ps db

# Check logs
docker compose logs db

# Restart database
docker compose restart db
```

### Port 3000 Already in Use

```bash
# Docker
docker compose down

# Local
kill $(lsof -ti:3000)
```

### Changes Not Reflected (Docker)

The `watch` feature syncs `/src` folder. If using other folders:
```bash
docker compose restart app
```

### Hot Reload Not Working

```bash
# Stop and restart
docker compose down
docker compose watch
```

## Next Steps

- Review [API Documentation](../api/bidding.yaml)
- Understand [Database Schema](../schemas/database-schema.md)
- Study [Project Architecture](../diagrams/architecture.md)
- Check [Deployment Guide](./deployment.md)
