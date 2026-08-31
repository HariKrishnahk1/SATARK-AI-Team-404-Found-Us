# SATARK AI — REST API Documentation

**Base API URL**: `http://localhost:8008/api/v1`  
**Swagger UI Interactive Docs**: `http://localhost:8008/docs`

---

## 1. Authentication Endpoints (`/auth`)

### `POST /auth/register`
Registers a new user under one of the 9 supported roles.
- **Request Body**:
  ```json
  {
    "name": "Rohan Mahato",
    "email": "citizen@satark.gov.in",
    "password": "password123",
    "role": "CITIZEN",
    "institution_name": "Ranchi Gram Panchayat"
  }
  ```

### `POST /auth/login`
Authenticates a user and returns a JWT bearer access token.
- **Request Body**:
  ```json
  {
    "email": "admin@satark.gov.in",
    "password": "password123"
  }
  ```
- **Response Body**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": "u-admin",
      "name": "Aakash Sharma",
      "email": "admin@satark.gov.in",
      "role": "SUPER_ADMIN"
    }
  }
  ```

---

## 2. Challenge Management Endpoints (`/challenges`)

### `POST /challenges`
Submits a new societal challenge. Runs AI classification, priority scoring, and solution direction generation automatically.
- **Request Body**:
  ```json
  {
    "title": "Heavy Arsenic & Fluoride Contamination in Village Borewells",
    "citizen_description": "Groundwater in Angara block village has severe fluoride contamination affecting 400 villagers.",
    "district": "Ranchi",
    "address": "Village Angara, Block Angara, Ranchi 835103",
    "latitude": 23.3699,
    "longitude": 85.3250
  }
  ```

### `GET /challenges`
Retrieves all reported challenges with optional filtering query parameters (`district`, `category`, `priority`, `status`).

### `POST /challenges/{id}/validate`
Government Admin validates challenge and can override AI severity or priority with recorded audit logs.
- **Request Body**:
  ```json
  {
    "severity": "CRITICAL",
    "priority": "URGENT",
    "override_reason": "Groundwater contamination directly affects school children health."
  }
  ```

### `POST /challenges/{id}/duplicates`
Runs `pgvector` text embedding cosine similarity search and GIS distance checks to return potential duplicates.

---

## 3. University & Proposal Endpoints

### `GET /universities/recommendations/{challenge_id}`
Runs AI Module 4 to return recommended HEIs based on academic discipline, lab facilities, and match score.

### `POST /universities/assign?challenge_id={id}&university_id={uni_id}`
Assigns a validated challenge to a specific university.

### `POST /proposals`
Submits a university solution proposal with estimated budget in INR ₹.
- **Request Body**:
  ```json
  {
    "challenge_id": "JH-2026-0001",
    "title": "Solar-Powered Bio-Sand & Activated Alumina De-Fluoridation Kiosk",
    "abstract": "A 1,000 LPH solar-powered filter combining activated alumina adsorption and bio-sand filtration.",
    "faculty_lead_name": "Dr. Swati Sen (BIT Mesra)",
    "student_members": ["Aniket Sen", "Priya Verma", "Rahul Mahato"],
    "estimated_cost_inr": 350000.0,
    "duration_months": 4
  }
  ```

---

## 4. Industry & CSR Sponsorship Endpoints (`/industry`)

### `POST /industry/sponsorships`
Pledges CSR funding in INR ₹, mentorship, and prototyping support for an approved proposal.
- **Request Body**:
  ```json
  {
    "proposal_id": "prop-001",
    "organization_name": "Tata Steel CSR Division",
    "partner_type": "CSR",
    "contact_person": "Sanjay Chatterji",
    "funding_pledged_inr": 350000.0,
    "mentorship_provided": "Technical review by Tata Steel Water Treatment Engineering team.",
    "prototyping_support": true
  }
  ```

---

## 5. Analytics & Social Impact Endpoints (`/analytics`)

### `GET /analytics/stats`
Returns aggregated state-wide KPI metrics: Total Challenges, New, Validated, Active HEI Projects, Total CSR Funding Pledged (in INR ₹), Solutions Deployed, Patents Filed, Startups Incubated, and Estimated Beneficiaries.
