# SATARK AI — System Architecture & Technical Specifications

**Smart India Hackathon 2026** | **Problem Statement ID: SIH26043**  
**Organization**: Government of Jharkhand — Department of Higher & Technical Education  
**Team**: 404 FOUND US

---

## 1. High-Level System Architecture

SATARK AI uses a decoupled, micro-service ready architecture consisting of a **Next.js 14 App Router Frontend Platform**, a **FastAPI Async Backend Engine**, a **PostgreSQL + pgvector Database**, a **Redis Cache Layer**, a **LangChain + OpenAI GPT-4o AI Engine**, and a **Socket.io Real-Time Event System**.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    UNIFIED NEXT.JS 14 APP ROUTER FRONTEND                       │
│   ┌──────────────────┐ ┌─────────────────┐ ┌───────────────┐ ┌───────────────┐ │
│   │ CITIZEN PORTAL   │ │ GOVT/ADMIN PORTAL│ │ HEI PORTAL    │ │ INDUSTRY PORTAL│ │
│   │ (/citizen)       │ │ (/admin)        │ │ (/hei)        │ │ (/industry)   │ │
│   └──────────────────┘ └─────────────────┘ └───────────────┘ └───────────────┘ │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ REST API / WebSockets (JWT Auth)
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             FASTAPI BACKEND SERVICE                             │
│  - Python 3.14 + SQLAlchemy ORM + Pydantic v2                                   │
│  - SQLite / PostgreSQL Database + pgvector fallback                             │
│  - LangChain + OpenAI GPT-4o AI Engine + Deterministic Heuristics               │
│  - Socket.io Real-Time Broadcast Engine                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Role-Based Access Control (RBAC) Matrix

SATARK AI enforces strict RBAC across 9 distinct stakeholder roles:

| Role Code | Role Name | Permissions & Scope |
| :--- | :--- | :--- |
| `CITIZEN` | Citizen / Community | Submit challenge, upload photos/videos/docs, track status, give feedback. |
| `SUPER_ADMIN` | Government Super Admin | Full state-wide access, validate challenges, override AI classification, assign departments & HEIs. |
| `DEPARTMENT_HEAD` | Department Head | Department queue management, officer assignment, SLA monitoring. |
| `OFFICER` | Field Officer | Execute assigned tasks, submit resolution evidence. |
| `HEI_COORDINATOR` | HEI Coordinator | University project acceptance, team formation, solution proposal submission. |
| `FACULTY_MENTOR` | Faculty Mentor | Project guidance, technical review, milestone approval. |
| `STUDENT_TEAM` | Student Innovator | Prototype execution, lab testing, milestone reporting. |
| `INDUSTRY_PARTNER` | Industry Partner | Browse solution proposals, pledge CSR funding in INR, offer mentorship. |
| `CSR_PARTNER` | CSR Organization | Fund prototypes, equipment support, pilot deployment sponsorship. |

---

## 3. Database Entity Relationship & pgvector Schema

### Core Tables
1. `users`: User identity, password hash (SHA256/bcrypt), role, institution, SLA compliance metrics.
2. `departments`: Government departments (Water Resources, Roads, Health, Agriculture, etc.) with SLA rule thresholds.
3. `challenges`: Citizen reported challenges, title, description, district, GPS coordinates, category, severity, priority (0-100 score), status (15 stages).
4. `ai_analyses`: AI classification, keywords, severity, priority score, reasoning, vector embedding (128/1536 dimensions).
5. `challenge_duplicates`: pgvector cosine similarity score and distance bounds.
6. `universities`: HEI research facilities, lab equipment, faculty leads, and match scores.
7. `solution_proposals`: University solution proposals, budget in INR ₹, technology stack, student members, and status.
8. `industry_sponsorships`: CSR funding pledges in INR ₹, mentorship, and equipment support.
9. `project_milestones`: Milestone targets (M1-M4), status, deliverables, completion percentages.
10. `innovation_outcomes`: Patents filed, startups incubated, pilot deployment locations, and beneficiaries count.
11. `notifications` & `audit_logs`: Socket.io notification queue and government override audit trails.

---

## 4. AI Engine Pipeline (Five Core Modules)

```
Input: Citizen Description + Photo + Location
  │
  ├─► Module 1: Semantic Classification ──► Domain, Category, Subcategory, Keywords
  │
  ├─► Module 2: Priority Prediction ──────► 0-100 Priority Score, Severity, Urgency Reasoning
  │
  ├─► Module 3: Duplicate Detection ──────► pgvector Embedding Cosine Similarity & Distance
  │
  ├─► Module 4: HEI Recommendation ───────► Discipline & Lab Equipment Match Scoring
  │
  └─► Module 5: Solution Generator ────────► 4 Technical Solution Directions
```

---

## 5. Real-Time Socket.io Event Architecture

| Event Name | Trigger | Target Audience | Payload |
| :--- | :--- | :--- | :--- |
| `NEW_CHALLENGE` | Citizen submits issue | Super Admin, Dept Head | Challenge ID, District, Priority Score |
| `CHALLENGE_VALIDATED` | Admin validates issue | Citizen, HEI Coordinator | Challenge ID, Status, District |
| `HEI_ASSIGNED` | Admin assigns HEI | HEI Coordinator | University ID, University Name, Status |
| `PROPOSAL_SUBMITTED` | HEI submits proposal | Industry / CSR Partners | Proposal ID, Budget INR, Title |
| `SPONSORSHIP_PLEDGED` | CSR Partner pledges funding | HEI Coordinator | Organization Name, Funding INR |
| `MILESTONE_UPDATED` | Team updates milestone | All Stakeholders | Milestone ID, Completion % |
| `PROJECT_RESOLVED` | Pilot trial verified | Citizen & Public | Beneficiaries Count, Outcome Metrics |
