# Deal Data Flow Sequence Diagram

Visualization of how "Deal" data flows from Group 2 (Bidding Service) to Group 4 (Milestone Service) for milestone creation.

## Main Sequence Flow

```mermaid
sequenceDiagram
    participant Mitra as Mitra (Project Owner)
    participant Kelompok as Group 2<br/>(Bidding Service)
    participant Database as Database<br/>(Project Bidding)
    participant APIGateway as API Gateway/<br/>Message Queue
    participant Kelompok4 as Group 4<br/>(Milestone Service)
    participant DBMilestone as Database<br/>(Milestone)

    note over Mitra,Kelompok4: === STEP 1: PROJECT CREATION ===
    Mitra->>Kelompok: POST /api/projects<br/>(Create project with budget & timeline)
    Kelompok->>Database: INSERT into 'proyek'<br/>(store project details)
    Database-->>Kelompok: Project created (project_id=1)
    Kelompok-->>Mitra: Return Project Object<br/>(judul, budget_awal, timeline_pendaftaran)

    note over Mitra,Kelompok4: === STEP 2: BIDDING PROCESS ===
    Kelompok->>Kelompok: Group 2 Application Status:<br/>- Waiting for bids
    Kelompok->>Kelompok: GET /api/projects (Display to students)
    
    Kelompok->>Kelompok: POST /api/bidding<br/>(Group submits bid with:<br/>- tawaran_harga<br/>- tawaran_waktu<br/>- dokumen_url)
    Kelompok->>Database: INSERT into 'bid'<br/>(store bid: bid_id=1)
    Database-->>Kelompok: Bid Confirmed
    Kelompok-->>Kelompok: Bid Status: QUEUED

    note over Mitra,Kelompok4: === STEP 3: NEGOTIATION ===
    Mitra->>Kelompok: GET /api/bidding<br/>(View all bids)
    Kelompok->>Kelompok: Response (role-based filtering)<br/>Shows bids to Mitra
    
    Mitra->>Kelompok: POST /api/negotiating/{bid_id}<br/>(Send counter-offer:<br/>- response_harga<br/>- response_waktu<br/>- role_: 'Mitra')
    Kelompok->>Database: INSERT into 'negosiasi'<br/>(store negotiation: nego_id=1)
    Database-->>Kelompok: Negotiation Recorded
    
    Kelompok->>Kelompok: Update Bid Status: PENDING
    Kelompok->>Kelompok: Notify Group: Counter-offer received
```

## Integration with Group 4

Once a deal is finalized, the following information is sent to Group 4:

- Project ID
- Final Budget (budget_final)
- Final Timeline (waktu_final)
- Group ID
- Partner ID
- Project Details

This data enables Group 4 to create appropriate milestones for the project.
