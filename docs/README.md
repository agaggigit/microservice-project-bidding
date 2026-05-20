# Project Bidding Microservice Documentation

Welcome to the comprehensive documentation for the **Project Bidding Microservice** (Group 2). This documentation covers all aspects of the system architecture, API specifications, database schema, and operational guides.

## 📚 Documentation Structure

### 📊 [API Documentation](api/)
- **[bidding.yaml](api/bidding.yaml)** - Complete API specification with endpoints and examples
- **[swagger.yaml](api/swagger.yaml)** - OpenAPI specification

### 🏗️ [Architecture & Diagrams](diagrams/)
- **[architecture.md](diagrams/architecture.md)** - System architecture and actual implementation details
- **[erd.md](diagrams/erd.md)** - Entity Relationship Diagram
- **[sequence-diagrams.md](diagrams/sequence-diagrams.md)** - Data flow diagrams

### 📖 [Implementation Guides](guides/)
- **[setup.md](guides/setup.md)** - Local development setup with Docker
- **[deployment.md](guides/deployment.md)** - Production deployment strategies

### 🗄️ [Database](schemas/)
- **[database-schema.md](schemas/database-schema.md)** - Complete database schema and table definitions

## 🎯 Quick Start

### Development with Docker (Recommended)

```bash
# Clone and start
git clone https://github.com/agaggigit/microservice-project-bidding.git
cd apl-development

# Start with hot reload
docker compose watch

# Load database schema
docker compose exec app psql -U postgres -d bidding -f database_schema.sql

# Verify
curl http://localhost:3000
```

**Services:**
- API: http://localhost:3000
- Database: localhost:5433 (postgres:postgres)

### Development without Docker

```bash
npm install
createdb bidding
psql -U postgres -d bidding -f database_schema.sql
npm run dev
```

## 📋 System Overview

### � System Overview

### Current Implementation

✅ **Working Features:**
- Project Management (Full CRUD)
- Bid Submission
- Role-Based Bid Retrieval (Partners see their project bids; Groups see their own bids)
- Negotiation Creation
- PostgreSQL Database
- Docker Development Setup

⏳ **Planned Features:**
- Bid acceptance/rejection with quota management
- Complete negotiation workflow
- Deal finalization notification to Group 4

### Main Workflow

```
1. Partner creates Project
2. Groups submit Bids (with price & timeline offers)
3. Partner reviews Bids
4. Negotiation between Partner and Groups (Optional)
5. Deal finalization to Group 4 (Future)
```

| Method | Endpoint | Purpose |
### Projects
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Bidding & Negotiation
**Type:** PostgreSQL 18+
**Tables:** mitra, proyek, kelompok, mahasiswa, bid, negosiasi

**Key Features:**
- Automatic project status update based on bid quota
- Ro� Authentication

**Method:** Header-based (Stateless)

```
Headers:
  X-� Project Structure

```
src/
├── app.js                  # Express setup
├── server.js               # Entry point
├── config/db.js            # Database connection
├── features/
│   ├── projects/
│   ├── bidding/
│   └── negotiating/
├── middleware/
├── utils/
└── helper_function/
```

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | v24-alpine |
| Framework | Express.js | 5.2.1+ |
| Database | PostgreSQL | 18-alpine |
| Driver | pg | 8.20.0+ |
| Containerization | Docker Compose | Latest |

---

**Status:** ✅ Production Ready (Core Features Complete)  
**Last Updated:** May 2026  
**Repository:** https://github.com/agaggigit/microservice-project-bidding

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **API Docs:** Swagger/OpenAPI
- **Authentication:** JWT
- **Containerization:** Docker

## 📞 Support & Contacts

- **Issues:** Create an issue in the repository
- **Questions:** Contact the development team
- **Documentation:** All docs are in this folder

## 📝 Version History

- **v1.0.0** - Initial release with Project, Bidding, and Negotiation modules
- **v1.1.0** - Enhanced negotiation flow and integrations
- **v2.0.0** - Microservice architecture redesign

## 📄 Additional Resources

- Repository: [Link to repo]
- API Base URL: http://localhost:3000 (development)
- API Documentation UI: http://localhost:3000/api-docs

---

**Last Updated:** May 2026  
**Status:** ✅ Production Ready
