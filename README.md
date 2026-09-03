# SATARK AI — System for Automated Tracking, AI-assisted Routing & Knowledge-driven Action

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-blue.svg)](https://www.sih.gov.in/)
[![Problem Statement](https://img.shields.io/badge/PS-PS26043%20%2F%20SIH26043-emerald.svg)](https://www.sih.gov.in/)
[![Government of Jharkhand](https://img.shields.io/badge/Organization-Govt%20of%20Jharkhand-orange.svg)](https://jharkhand.gov.in/)
[![Department](https://img.shields.io/badge/Department-Higher%20%26%20Technical%20Education-cyan.svg)](https://jharkhand.gov.in/)
[![Team](https://img.shields.io/badge/Team-404%20FOUND%20US-purple.svg)](https://github.com/HariKrishnahk1/SATARK-AI-Team-404-Found-Us)

> **Official Tagline**: *"Report • Predict • Connect • Resolve"*  
> **Supporting Vision**: *"From societal challenges to collaborative solutions."*

---

## 📌 Executive Summary

**SATARK AI** is a unified digital platform designed for the **Department of Higher & Technical Education, Government of Jharkhand** to crowdsource societal challenges across the state and convert them into evaluated, researchable, fundable, and deployable innovation projects through Higher Education Institutions (HEIs) and Industry CSR partnerships.

Rather than acting merely as a complaint registration website, **SATARK AI** forms a collaborative societal innovation ecosystem connecting:
1. **Citizens & Communities** (Problem Reporters)
2. **Government Authorities** (Evaluators, Dispatchers & SLA Monitors)
3. **Universities & HEIs** (Faculty Expertise, Student Innovators & R&D Labs)
4. **Industry & CSR Organizations** (Funding, Technical Mentorship & Prototyping Support)

---

## 🏛 Ecosystem Workflow

```
SOCIETAL CHALLENGE
        ↓
CITIZEN / COMMUNITY REPORT (Photos, Video, Geolocation)
        ↓
AI ANALYSIS (Domain Classification, 0-100 Priority Score & Solution Directions)
        ↓
GOVERNMENT VALIDATION (Admin Override, Department Routing & Audit Logging)
        ↓
UNIVERSITY MATCHING (Discipline, Lab & Faculty Match Scoring)
        ↓
MULTIDISCIPLINARY STUDENT TEAM (Faculty Mentor & Innovation Project)
        ↓
SOLUTION PROPOSAL (Budget in INR ₹, Technology Stack & Milestones)
        ↓
INDUSTRY / CSR COLLABORATION (CSR Funding, Mentorship & Equipment Support)
        ↓
PROTOTYPE DEVELOPMENT → PILOT FIELD TRIAL → IMPACT MEASUREMENT
        ↓
RESOLVED / DEPLOYED (Patents Filed, Startups Incubated & Community Beneficiaries)
```

---

## 🛠 Official Tech Stack

- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide Icons, Leaflet Maps
- **Backend API**: Python 3.14, FastAPI, Pydantic v2, SQLAlchemy ORM
- **Database & Search**: PostgreSQL with `pgvector` extension for semantic vector similarity search & SQLite zero-dependency fallback
- **Caching Layer**: Redis
- **AI Engine**: LangChain + OpenAI GPT-4o with deterministic rule-based heuristic fallbacks
- **Real-Time Events**: Socket.io Server & Client Toast Notifications
- **Authentication & Security**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC) across 9 roles

---

## 👥 Team 404 FOUND US & Branch Ownership

| Member Name | Year | GitHub ID | Assigned Role | Branch Ownership |
| :--- | :--- | :--- | :--- | :--- |
| **Hari Krishna DK** | 3rd Year | `@HariKrishnahk1` | **Team Lead + System Architect** | `feature/system-architecture` |
| **Bharath Kumar** | 2nd Year | `@kumaranbk48-code` | **AI/ML Engineer** | `feature/ai-engine` |
| **Nature Hari** | 3rd Year | `@naturehari` | **Citizen Portal Developer** | `feature/citizen-portal` |
| **Divya** | 3rd Year | `@Divya0202941` | **Govt / Admin Portal Developer** | `feature/admin-portal` |
| **Deepika** | 3rd Year | `@deepikadp30` | **University / HEI Portal Developer** | `feature/university-portal` |
| **Gowsalya Veerappan** | 2nd Year | `@gowsalyaveerappan01-aids` | **Industry / CSR + Impact Developer** | `feature/industry-impact` |

---

## 🤖 Five Core AI Engine Modules

1. **Module 1: Problem Classification**: Categorizes citizen inputs into 12 societal domains (Water Resources, Urban Infrastructure, Healthcare, Agriculture, Sanitation, Disaster Mgmt, etc.).
2. **Module 2: Priority Prediction**: Computes severity, urgency, population impact, and safety risk to output a **0–100 priority score** with explainable reasoning.
3. **Module 3: Duplicate Detection**: Uses `pgvector` semantic text embeddings and GIS distance bounds to flag potential duplicate challenges.
4. **Module 4: HEI Recommendation Engine**: Matches validated problems to Jharkhand universities (BIT Mesra, NIT Jamshedpur, IIT ISM Dhanbad, Ranchi University) based on disciplines, labs, and faculty expertise.
5. **Module 5: Solution Direction Recommender**: Generates 3–4 technical solution directions (e.g. solar bio-sand filtration, computer vision pavement audit, telemedicine kiosk).

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Git

### 2. Backend Setup
```bash
git clone https://github.com/HariKrishnahk1/SATARK-AI-Team-404-Found-Us.git
cd SATARK-AI-Team-404-Found-Us

# Install Python dependencies
pip install -r backend/requirements.txt

# Seed Jharkhand demo data
set PYTHONPATH=backend
python backend/seed.py

# Run FastAPI backend server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8008
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Application Endpoints
- **Unified SATARK AI Platform (Next.js)**: `http://localhost:3000`
  - Multi-Portal Auth Gateway: `http://localhost:3000/login`
  - Citizen Portal: `http://localhost:3000/citizen`
  - Government Command Centre: `http://localhost:3000/admin`
  - University & HEI Portal: `http://localhost:3000/hei`
  - Student Workspace: `http://localhost:3000/student`
  - Industry CSR Hub: `http://localhost:3000/industry`
- **FastAPI Interactive API Docs**: `http://localhost:8008/docs`

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Access / Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@satark.gov.in` | `password123` | Full Government Command Centre & Overrides |
| **Citizen** | `citizen@satark.gov.in` | `password123` | Challenge Submission & Tracking |
| **HEI Coordinator** | `hei@bitmesra.ac.in` | `password123` | BIT Mesra R&D & Solution Proposals |
| **Industry Partner** | `csr@tatasteel.com` | `password123` | Tata Steel CSR Funding & Mentorship |
| **Department Head** | `depthead@satark.gov.in` | `password123` | Water Resources Department Routing |

---

## 📄 Documentation

- [System Architecture](docs/ARCHITECTURE.md)
- [REST API Specifications](docs/API.md)
- [Team Member Contributions](docs/TEAM_CONTRIBUTIONS.md)

---

## 📜 License & Copyright

Developed by **Team 404 FOUND US** for **Smart India Hackathon 2026** (Problem Statement ID: SIH26043).  
Dedicated to the **Department of Higher & Technical Education, Government of Jharkhand**.
