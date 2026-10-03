# SATARK AI — System for Automated Tracking, AI-assisted Routing & Knowledge-driven Action

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-blue.svg)](https://www.sih.gov.in/)
[![Problem Statement](https://img.shields.io/badge/PS-PS26043%20%2F%20SIH26043-emerald.svg)](https://www.sih.gov.in/)
[![Government of Jharkhand](https://img.shields.io/badge/Organization-Govt%20of%20Jharkhand-orange.svg)](https://jharkhand.gov.in/)
[![Department](https://img.shields.io/badge/Department-Higher%20%26%20Technical%20Education-cyan.svg)](https://jharkhand.gov.in/)
[![Team](https://img.shields.io/badge/Team-404%20FOUND%20US-purple.svg)](https://github.com/HariKrishnahk1/SATARK-AI-Team-404-Found-Us)

## 🌐 Live Demo

### 👤 Citizen Portal

[Open SATARK AI Citizen Portal](https://satark-ai-citizen.onrender.com/)

### 🛡️ Admin Portal

[Open SATARK AI Admin Portal](https://satark-ai-admin.onrender.com/)

📌 About SATARK AI

SATARK AI is a digital platform designed to crowdsource societal challenges and connect them with Government, Universities, Students, Faculty, and Industry to move from problem identification towards practical solutions.

The platform goes beyond conventional problem-reporting systems by introducing an AI-assisted workflow for analysing challenges and connecting validated problems with suitable academic and industry participants.

🎯 Smart India Hackathon 2026
Problem Statement ID: SIH26043 / PS26043
Problem Statement: A digital platform to crowdsource societal challenges and facilitate collaborative problem-solving through universities and industry partnerships
Organization: Government of Jharkhand
Department: Higher & Technical Education
Theme: Smart Education
Category: Software
Team: 404 FOUND US
🌐 Live Demo

SATARK AI is deployed through separate portals for different stakeholders.

👤 Citizen Portal

The Citizen Portal allows users to submit societal challenges with relevant information and track their progress.

🔗 Open SATARK AI Citizen Portal

🛡️ Government / Admin Portal

The Admin Portal allows authorized administrators to review, validate, analyse, route, and monitor submitted challenges.

🔗 Open SATARK AI Admin Portal

🚀 Deployment
Portal	Purpose	Live Application
👤 Citizen Portal	Challenge submission and tracking	Open Portal
🛡️ Admin Portal	Validation, routing and monitoring	Open Portal
🚨 Problem

Societal challenges are often reported through different channels, making it difficult to maintain a structured connection between the people facing the problem and the organizations capable of solving it.

At the same time:

Citizens may not have a structured mechanism to submit challenges.
Government authorities need better organization and prioritization of incoming challenges.
Universities and students may have technical expertise but limited visibility into real-world societal problems.
Industry and other organizations can provide technology, mentoring, funding, or deployment support but may not have a structured pipeline of validated challenges.
Similar problems may be reported multiple times.
A reported problem can remain disconnected from long-term solution development.

SATARK AI addresses this gap by creating a collaborative journey from problem identification to solution development.

💡 Our Solution

SATARK AI brings multiple stakeholders into a connected ecosystem:

Citizen → Government → University → Student/Faculty → Industry → Solution → Impact

A citizen can submit a societal challenge with relevant information.

The AI layer analyses the challenge and supports:

Problem classification
Priority prediction
Duplicate detection
University recommendation
Solution recommendation

The government/admin side can then review and validate the AI-assisted analysis.

Validated challenges can be connected with suitable university teams, where students and faculty can work on developing solutions.

Industry and other ecosystem participants can contribute through mentoring, technical support, funding, prototyping, or deployment assistance.

🔄 System Workflow
                    SOCIETAL CHALLENGE
                           │
                           ▼
              ┌─────────────────────────┐
              │    CITIZEN / COMMUNITY  │
              │      SUBMISSION         │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │      AI ANALYSIS        │
              │                         │
              │ • Classification       │
              │ • Priority Prediction  │
              │ • Duplicate Detection  │
              │ • University Matching  │
              │ • Solution Direction   │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │ GOVERNMENT VALIDATION   │
              │                         │
              │ • Review               │
              │ • Verify               │
              │ • Route                │
              │ • Monitor              │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │ UNIVERSITY / HEI        │
              │                         │
              │ • Challenge Matching   │
              │ • Student Teams        │
              │ • Faculty Mentoring    │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │ INDUSTRY / ECOSYSTEM   │
              │                         │
              │ • Mentoring            │
              │ • Technical Support    │
              │ • Funding / Resources  │
              │ • Deployment Support   │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │ SOLUTION DEVELOPMENT    │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │ REAL-WORLD IMPACT       │
              └─────────────────────────┘
🤖 Five Core AI Modules
1. Problem Classification

The system analyses the submitted problem description and identifies the relevant problem category or domain.

For example, a report concerning water leakage can be classified under the appropriate water or infrastructure-related category.

This converts unstructured problem descriptions into structured information that can be processed by the platform.

2. Priority Prediction

The system analyses the reported challenge to estimate its urgency and importance.

Factors such as the nature of the problem, potential impact, and severity can be considered to support administrative prioritization.

The AI output assists administrators; final validation remains under human control.

3. Duplicate Detection

Multiple users may report the same or highly similar societal challenge.

SATARK AI uses similarity-based analysis to identify potentially duplicate or related reports.

This can help administrators reduce repeated handling of the same underlying problem.

4. University Recommendation

After a challenge is validated, the system can recommend suitable university or academic expertise based on the nature of the problem.

This helps connect societal challenges with relevant academic disciplines, student teams, faculty expertise, and research capabilities.

5. Solution Recommendation

The AI system can provide initial solution directions based on the identified problem.

These recommendations are intended to support students, faculty, and other participants during the early stages of solution development.

The final solution is developed and evaluated by the relevant human teams.

🏗️ Technical Architecture
┌─────────────────────────────────────────────┐
│              USER PORTALS                   │
│                                             │
│  Citizen Portal       Admin Portal          │
│                                             │
│       Next.js 14 + TypeScript               │
│       Tailwind CSS + Socket.io              │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│              BACKEND API                    │
│                                             │
│                 FastAPI                     │
│                                             │
│       Authentication / Business Logic       │
│       API Communication / AI Workflow       │
└──────────────────────┬──────────────────────┘
                       │
          ┌────────────┴─────────────┐
          ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐
│      AI LAYER        │   │     DATA LAYER       │
│                      │   │                      │
│ LangChain            │   │ PostgreSQL           │
│ OpenAI GPT-4o        │   │ pgvector             │
│                      │   │ Redis                │
│ • Classification     │   │                      │
│ • Priority           │   │ Structured Data      │
│ • Duplicate Check    │   │ Similarity Search    │
│ • University Match   │   │ Performance / Cache  │
│ • Solution Ideas     │   │                      │
└──────────────────────┘   └──────────────────────┘
                       │
                       ▼
              ┌───────────────────┐
              │ SECURITY LAYER    │
              │                   │
              │ JWT Authentication│
              │ RBAC              │
              └───────────────────┘
🛠️ Technology Stack
Frontend
Next.js 14
TypeScript
Tailwind CSS
Socket.io
Leaflet Maps
Backend
Python
FastAPI
Pydantic
SQLAlchemy
Database
PostgreSQL
pgvector
Redis
AI / ML
LangChain
OpenAI GPT-4o
Similarity-based analysis for duplicate detection and matching
Security
JWT Authentication
Role-Based Access Control (RBAC)
🔐 Security & Access Control

SATARK AI uses role-based access to separate responsibilities between different stakeholders.

Key security mechanisms
JWT-based authentication
Role-Based Access Control
Protected APIs
Controlled access to stakeholder-specific functionality
Human validation of AI-assisted results

The AI assists the decision-making workflow, while important administrative actions remain under authorized human control.

👥 Stakeholder Ecosystem
👤 Citizens
Submit societal challenges
Provide problem descriptions and supporting information
Track submitted challenges
🏛️ Government / Administrators
Review submitted challenges
Validate reports
Review AI-generated analysis
Manage routing and status
Monitor progress
🎓 Universities / HEIs
Discover relevant societal challenges
Connect challenges with academic expertise
Form student teams
Provide faculty mentoring
Develop potential solutions
🏢 Industry / Organizations
Provide technical expertise
Mentor student teams
Support prototyping
Support resources or funding where applicable
Assist with deployment and practical implementation
🌟 What Makes SATARK AI Different?

Existing platforms may focus primarily on reporting, routing, grievance management, or innovation challenges.

SATARK AI focuses on what happens after a problem is reported.

Conventional Flow
Problem
   ↓
Report
   ↓
Route
   ↓
Resolve
SATARK AI Flow
Problem
   ↓
AI Analysis
   ↓
Validation
   ↓
University Matching
   ↓
Student + Faculty Team
   ↓
Industry Collaboration
   ↓
Solution Development
   ↓
Real-World Impact

SATARK AI goes beyond just reporting problems. It turns them into potential real projects by connecting them with universities, students, and industry to build practical solutions and create real-world impact.

📊 Expected Impact
Citizens
Easier challenge submission
Better visibility of reported problems
Ability to track progress
Government
Organized challenge management
AI-assisted analysis
Identification of repeated challenges
Better monitoring of challenge progress
Universities & Students
Access to real-world societal challenges
Practical project opportunities
Multidisciplinary collaboration
Faculty-guided solution development
Industry
Opportunities for technical mentorship
Collaboration with academic teams
Support for promising prototypes
Potential pathways towards practical deployment
Society
Reduced duplication of efforts
Better connection between problems and expertise
Stronger collaboration between communities, government, academia, and industry
📁 Project Structure
SATARK-AI-Team-404-Found-Us/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   └── ...
│
├── backend/
│   ├── app/
│   ├── requirements.txt
│   ├── seed.py
│   └── ...
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── TEAM_CONTRIBUTIONS.md
│
├── README.md
└── ...
🚀 Running the Project Locally
Prerequisites
Python 3.10+
Node.js 18+
npm
Git
PostgreSQL
Redis
1. Clone Repository
git clone https://github.com/HariKrishnahk1/SATARK-AI-Team-404-Found-Us.git

cd SATARK-AI-Team-404-Found-Us
2. Backend Setup
pip install -r backend/requirements.txt

Configure the required environment variables and database connection.

Then start the FastAPI server:

python -m uvicorn app.main:app --host 0.0.0.0 --port 8008
3. Frontend Setup
cd frontend

npm install

npm run dev

The frontend can then be accessed through the local development URL provided by Next.js.

🔗 Repository

GitHub Repository:

https://github.com/HariKrishnahk1/SATARK-AI-Team-404-Found-Us

🎥 Prototype / Demonstration

Citizen Portal:
https://satark-ai-citizen.onrender.com/

Admin Portal:
https://satark-ai-admin.onrender.com/

📚 Documentation
System Architecture
REST API Specifications
Team Member Contributions

👨‍💻 Team 404 FOUND US

Member	                  Year	           GitHub
Hari Krishna DK  	3rd Year	@HariKrishnahk1
Bharath Kumar	        2nd Year	@kumaranbk48-code
Nature Hari	        3rd Year	@naturehari
Divya	                3rd Year	@Divya0202941
Deepika	                3rd Year	@deepikadp30
Gowsalya Veerappan	2nd Year	@gowsalyaveerappan01-aids

🏆 Smart India Hackathon 2026

Team: 404 FOUND US
Project: SATARK AI
Problem Statement ID: SIH26043
Organization: Government of Jharkhand
Department: Higher & Technical Education
Theme: Smart Education
Category: Software

📜 Project Statement

SATARK AI aims to create a structured digital ecosystem where societal challenges can be identified, analysed, validated, connected with relevant academic expertise, and developed into practical solutions through collaboration between communities, government, universities, students, faculty, and industry.

SATARK AI — Report • Predict • Connect • Resolve

From societal challenges to collaborative solutions.
