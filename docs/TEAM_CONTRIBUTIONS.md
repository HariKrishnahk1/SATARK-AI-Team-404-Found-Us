# SATARK AI — Team Member Contributions & Responsibility Matrix

**Smart India Hackathon 2026** | **Team 404 FOUND US** | **Problem Statement ID: PS26043**

---

## 👥 Member 1: Hari Krishna DK (Team Lead)

- **Year**: 3rd Year
- **GitHub ID**: `@HariKrishnahk1`
- **GitHub Email**: `dkharikrishna2007@gmail.com`
- **Role**: Team Lead + System Architect + Integration Engineer
- **Branch**: `feature/system-architecture`
- **Primary Technical Contributions**:
  - Designed high-level full-stack system architecture combining Next.js 14, FastAPI, PostgreSQL, Redis, Socket.io, and LangChain.
  - Implemented JWT authentication engine and 9-role Role-Based Access Control (RBAC) middleware (`backend/app/core/security.py`, `backend/app/api/auth.py`).
  - Created central PostgreSQL schema and SQLAlchemy ORM data model layer (`backend/app/models/models.py`).
  - Configured Socket.io real-time event engine and toast notifications (`backend/app/core/sockets.py`, `frontend/src/context/SocketContext.tsx`).
  - Coordinated overall repository structure, end-to-end pytest automated testing suite (`backend/tests/test_api.py`), and system documentation.

---

## 👥 Member 2: Bharath Kumar

- **Year**: 2nd Year
- **GitHub ID**: `@kumaranbk48-code`
- **GitHub Email**: `kumaranbk48@gmail.com`
- **Role**: AI/ML Engineer
- **Branch**: `feature/ai-engine`
- **Primary Technical Contributions**:
  - Implemented Module 1 (Semantic Problem Classification) categorizing citizen descriptions across 12 societal domains (`backend/app/ai/engine.py`).
  - Developed Module 2 (0-100 Priority Prediction) evaluating severity, urgency, population impact, and safety risk.
  - Built Module 3 (Duplicate Detection) using `pgvector` text embedding cosine similarity and GIS haversine distance.
  - Built Module 4 (University Recommendation Engine) matching validated problems to HEIs (BIT Mesra, NIT Jamshedpur, IIT ISM Dhanbad) based on disciplines, labs, and faculty expertise.
  - Built Module 5 (Solution Direction Generator) generating 3-4 actionable technical approaches with deterministic heuristic fallbacks.

---

## 👥 Member 3: Nature Hari

- **Year**: 3rd Year
- **GitHub ID**: `@naturehari`
- **GitHub Email**: `harishahj05@gmail.com`
- **Role**: Citizen Portal Developer
- **Branch**: `feature/citizen-portal`
- **Primary Technical Contributions**:
  - Developed Citizen & Community Portal interface (`frontend/src/app/citizen/page.tsx`).
  - Integrated challenge submission form with photo attachment, district dropdown, and browser geolocation location pin.
  - Connected real-time AI classification preview displaying priority score and solution directions.
  - Built progress tracking feed and status progression drawer for citizens.

---

## 👥 Member 4: Divya

- **Year**: 3rd Year
- **GitHub ID**: `@Divya0202941`
- **GitHub Email**: `divya020207@gmail.com`
- **Role**: Government / Admin Portal Developer
- **Branch**: `feature/admin-portal`
- **Primary Technical Contributions**:
  - Developed Government Command Centre Dashboard (`frontend/src/app/admin/page.tsx`).
  - Built 13 KPI cards tracking Total Issues, High Priority, Deployed Solutions, CSR Funding (INR ₹), Patents, and Beneficiaries.
  - Implemented interactive Leaflet GIS map with Jharkhand district markers (`frontend/src/components/LeafletMap.tsx`).
  - Built Live Queue Table with filtering, Validation / AI Override Modal with audit logging, and `pgvector` Duplicate Drawer.

---

## 👥 Member 5: Deepika

- **Year**: 3rd Year
- **GitHub ID**: `@deepikadp30`
- **GitHub Email**: `deepikadp1830@gmail.com`
- **Role**: University / HEI Portal Developer
- **Branch**: `feature/university-portal`
- **Primary Technical Contributions**:
  - Developed University & HEI Portal interface (`frontend/src/app/hei/page.tsx`).
  - Built assigned challenges drawer and acceptance workflow.
  - Implemented multidisciplinary student innovation team creation and faculty mentor assignment.
  - Built Solution Proposal Editor for submitting estimated budget in INR ₹, technology stack, timeline, and deliverables.

---

## 👥 Member 6: Gowsalya Veerappan

- **Year**: 2nd Year
- **GitHub ID**: `@gowsalyaveerappan01-aids`
- **GitHub Email**: `gowsalyaveerappan01@gmail.com`
- **Role**: Industry / CSR + Impact Module Developer
- **Branch**: `feature/industry-impact`
- **Primary Technical Contributions**:
  - Developed Industry & CSR Partner Portal (`frontend/src/app/industry/page.tsx`).
  - Built Solution Proposals Marketplace filtering university proposals by domain and impact.
  - Implemented CSR Funding Pledge form in INR ₹ (e.g. ₹3,50,000 pledged by Tata Steel CSR / Coal India R&D).
  - Built milestone progression visualizer (`frontend/src/components/Timeline.tsx`) and social impact measurement module tracking beneficiaries, patents filed, and startups incubated.
