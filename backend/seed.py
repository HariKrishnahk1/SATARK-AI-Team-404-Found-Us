import sys
import os
from datetime import datetime, timedelta, timezone

# Add backend root to sys.path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.models import (
    User, Department, Challenge, AIAnalysis, University,
    SolutionProposal, IndustrySponsorship, ProjectMilestone,
    InnovationOutcome, Notification, AuditLog
)

def seed_database():
    print("[SATARK AI Seed] Initializing database seed...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Departments
        dept_water = Department(
            id="dept-water",
            name="Water Resources & Sanitation",
            code="WRS-JH",
            description="Responsible for rural and urban clean water supply, drainage, and sanitation.",
            responsible_area="Water Quality, Rural Supply, Waste Water",
            head_name="Er. Ramesh Prasad",
            sla_critical_hours=24,
            sla_high_hours=48,
            sla_medium_hours=96,
            sla_low_hours=168
        )
        dept_infra = Department(
            id="dept-infra",
            name="Urban Infrastructure & Roads",
            code="UIR-JH",
            description="State public works department managing municipal roads, bridges, and public structures.",
            responsible_area="Roads, Potholes, Bridges, Municipal Works",
            head_name="Er. Sunita Verma",
            sla_critical_hours=24,
            sla_high_hours=72,
            sla_medium_hours=168,
            sla_low_hours=336
        )
        dept_health = Department(
            id="dept-health",
            name="Department of Health & Family Welfare",
            code="HFW-JH",
            description="Healthcare delivery, medical supplies, primary health centres, and disease prevention.",
            responsible_area="Hospitals, PHCs, Telemedicine, Outbreaks",
            head_name="Dr. Alok Kumar",
            sla_critical_hours=12,
            sla_high_hours=24,
            sla_medium_hours=72,
            sla_low_hours=120
        )
        dept_agri = Department(
            id="dept-agri",
            name="Department of Agriculture & Farmer Welfare",
            code="AFW-JH",
            description="Agricultural advisory, irrigation infrastructure, soil health, and pest management.",
            responsible_area="Irrigation, Soil Health, Farmers",
            head_name="Shri P. K. Singh",
            sla_critical_hours=48,
            sla_high_hours=96,
            sla_medium_hours=168,
            sla_low_hours=336
        )
        db.add_all([dept_water, dept_infra, dept_health, dept_agri])
        db.commit()

        # 2. Seed Users across all 9 roles
        users = [
            User(
                id="u-admin",
                name="Aakash Sharma",
                email="admin@satark.gov.in",
                hashed_password=get_password_hash("password123"),
                role="SUPER_ADMIN",
                designation="State Director",
                institution_name="Department of Higher & Technical Education, Jharkhand"
            ),
            User(
                id="u-citizen",
                name="Rohan Mahato",
                email="citizen@satark.gov.in",
                hashed_password=get_password_hash("password123"),
                role="CITIZEN",
                designation="Community Representative",
                institution_name="Ranchi Gram Panchayat"
            ),
            User(
                id="u-depthead",
                name="Er. Ramesh Prasad",
                email="depthead@satark.gov.in",
                hashed_password=get_password_hash("password123"),
                role="DEPARTMENT_HEAD",
                department_id="dept-water",
                designation="Chief Engineer"
            ),
            User(
                id="u-officer",
                name="Vikram Kumar",
                email="officer@satark.gov.in",
                hashed_password=get_password_hash("password123"),
                role="OFFICER",
                department_id="dept-infra",
                designation="Junior Engineer"
            ),
            User(
                id="u-hei",
                name="Dr. R. K. Sharma",
                email="hei@bitmesra.ac.in",
                hashed_password=get_password_hash("password123"),
                role="HEI_COORDINATOR",
                institution_name="BIT Mesra",
                designation="Dean of R&D"
            ),
            User(
                id="u-faculty",
                name="Dr. Swati Sen",
                email="faculty@bitmesra.ac.in",
                hashed_password=get_password_hash("password123"),
                role="FACULTY_MENTOR",
                institution_name="BIT Mesra",
                designation="Associate Professor, Environmental Engineering"
            ),
            User(
                id="u-student",
                name="Aniket Sen (Team Lead)",
                email="student@bitmesra.ac.in",
                hashed_password=get_password_hash("password123"),
                role="STUDENT_TEAM",
                institution_name="BIT Mesra",
                designation="B.Tech Final Year Innovator"
            ),
            User(
                id="u-industry",
                name="Sanjay Chatterji",
                email="csr@tatasteel.com",
                hashed_password=get_password_hash("password123"),
                role="INDUSTRY_PARTNER",
                institution_name="Tata Steel CSR Division",
                designation="Head of Social Innovation"
            ),
            User(
                id="u-csr",
                name="Meera Nair",
                email="csr@coalindia.in",
                hashed_password=get_password_hash("password123"),
                role="CSR_PARTNER",
                institution_name="Coal India R&D Foundation",
                designation="General Manager CSR"
            )
        ]
        db.add_all(users)
        db.commit()

        # 3. Seed Universities / HEIs
        unis = [
            University(
                id="hei-bit-mesra",
                name="BIT Mesra (Birla Institute of Technology)",
                district="Ranchi",
                disciplines=["Civil Engineering", "Environmental Engineering", "Computer Science", "Remote Sensing & GIS"],
                faculty_count=180,
                lab_facilities=["Geoinformatics Lab", "Water Quality & Environmental Testing Lab", "IoT & Robotics Centre"],
                innovation_centres=["BIT TBI Incubation Centre"],
                past_projects_count=24,
                contact_email="rnd@bitmesra.ac.in",
                is_demo_data=True
            ),
            University(
                id="hei-nit-jamshedpur",
                name="NIT Jamshedpur (National Institute of Technology)",
                district="East Singhbhum",
                disciplines=["Transportation Engineering", "Mechanical Engineering", "Electrical Engineering"],
                faculty_count=160,
                lab_facilities=["Structural Dynamics & Pavement Engineering Lab", "Clean Energy Centre"],
                innovation_centres=["NIT Jamshedpur Innovation Hub"],
                past_projects_count=19,
                contact_email="research@nitjsr.ac.in",
                is_demo_data=True
            ),
            University(
                id="hei-iit-ism-dhanbad",
                name="IIT (ISM) Dhanbad",
                district="Dhanbad",
                disciplines=["Mining & Environmental Geotechnology", "Water Resource Engineering", "Computer Science & AI"],
                faculty_count=220,
                lab_facilities=["Advanced Mine Water & Hydrology Lab", "AI & Data Science Centre"],
                innovation_centres=["TexMin Centre of Excellence"],
                past_projects_count=35,
                contact_email="dean_rnd@iitism.ac.in",
                is_demo_data=True
            )
        ]
        db.add_all(unis)
        db.commit()

        # 4. Seed 5 Realistic Jharkhand Societal Challenges
        c1 = Challenge(
            id="JH-2026-0001",
            title="Heavy Arsenic & Fluoride Contamination in Village Borewells",
            citizen_description="Groundwater in Angara block village has severe fluoride contamination. Over 400 villagers, including school children, face joint pain and dental fluorosis.",
            image_url="https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=600&auto=format&fit=crop",
            latitude=23.3699,
            longitude=85.3250,
            address="Village Angara, Block Angara, Ranchi, Jharkhand 835103",
            district="Ranchi",
            category="Water Resources",
            sub_category="Groundwater Contamination",
            department_id="dept-water",
            severity="CRITICAL",
            priority="URGENT",
            priority_score=94,
            ai_confidence=96.0,
            ai_reason="Fluoride contamination affects over 400 villagers and children causing permanent skeletal and dental fluorosis.",
            ai_reasoning_points=[
                "High population vulnerability (school children affected)",
                "Pertains to core drinking water safety",
                "Requires immediate multidisciplinary water treatment innovation"
            ],
            recommended_disciplines=["Environmental Engineering", "Chemical Engineering", "Public Health", "Biotechnology"],
            status="INDUSTRY_SPONSORED",
            assigned_university_id="hei-bit-mesra",
            sla_deadline=datetime.now(timezone.utc) + timedelta(hours=24)
        )

        c2 = Challenge(
            id="JH-2026-0002",
            title="Dangerous School Zone Pothole and Seasonal Flooding",
            citizen_description="Large open trench and pothole near St. Xavier School road. Rainwater accumulates up to 2 feet, causing frequent two-wheeler accidents during school drop-off hours.",
            image_url="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop",
            latitude=23.8103,
            longitude=86.4304,
            address="Main Road near School Gate, Bank More, Dhanbad, Jharkhand 826001",
            district="Dhanbad",
            category="Urban Infrastructure",
            sub_category="Road Hazard & Drainage",
            department_id="dept-infra",
            severity="HIGH",
            priority="HIGH",
            priority_score=89,
            ai_confidence=92.0,
            ai_reason="High risk near school zone with active traffic accidents during peak rush hours.",
            recommended_disciplines=["Civil Engineering", "Transportation Engineering", "Computer Vision"],
            status="PROPOSAL_SUBMITTED",
            assigned_university_id="hei-iit-ism-dhanbad",
            sla_deadline=datetime.now(timezone.utc) + timedelta(hours=72)
        )

        c3 = Challenge(
            id="JH-2026-0003",
            title="Lack of Cold Storage for Perishable Vegetable Crops",
            citizen_description="Smallholder vegetable farmers in Patamda block lose up to 40% of tomato and green chili produce daily due to absence of affordable localized cold storage facilities.",
            image_url="https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=600&auto=format&fit=crop",
            latitude=22.8046,
            longitude=86.2029,
            address="Patamda Farmer Mandi, East Singhbhum, Jharkhand 832105",
            district="East Singhbhum",
            category="Agriculture",
            sub_category="Post-Harvest Preservation",
            department_id="dept-agri",
            severity="HIGH",
            priority="HIGH",
            priority_score=85,
            ai_confidence=91.0,
            ai_reason="Severe economic distress to small farmers with 40% post-harvest produce loss.",
            recommended_disciplines=["Mechanical Engineering", "Agricultural Engineering", "Solar Energy"],
            status="HEI_ASSIGNED",
            assigned_university_id="hei-nit-jamshedpur",
            sla_deadline=datetime.now(timezone.utc) + timedelta(hours=96)
        )

        db.add_all([c1, c2, c3])
        db.commit()

        # 5. Seed Solution Proposal for Challenge 1
        prop1 = SolutionProposal(
            id="prop-001",
            challenge_id="JH-2026-0001",
            university_id="hei-bit-mesra",
            title="Solar-Powered Bio-Sand & Activated Alumina De-Fluoridation Kiosk",
            abstract="A decentralized 1,000 LPH solar-powered water filter unit combining activated alumina absorption and bio-sand filtration with IoT real-time fluoride sensors.",
            proposed_methodology="Multi-stage column filtration utilizing locally sourced low-cost activated alumina combined with real-time turbidity and fluoride telemetry.",
            technology_stack=["IoT Sensors", "Solar Photovoltaics", "Chemical Adsorption", "GSM Telemetry"],
            faculty_lead_name="Dr. Swati Sen (BIT Mesra)",
            student_members=["Aniket Sen", "Priya Verma", "Rahul Mahato"],
            estimated_cost_inr=350000.0,
            duration_months=4,
            status="APPROVED"
        )
        db.add(prop1)
        db.commit()

        # 6. Seed Industry Sponsorship for Proposal 1
        spon1 = IndustrySponsorship(
            id="spon-001",
            proposal_id="prop-001",
            organization_name="Tata Steel CSR Foundation",
            partner_type="CSR",
            contact_person="Sanjay Chatterji",
            funding_pledged_inr=350000.0,
            mentorship_provided="Technical review by Tata Steel Water Treatment Engineering team and prototyping lab access.",
            prototyping_support=True,
            equipment_support="High-precision fluoride testing spectrophotometer unit provided.",
            is_demo_data=True
        )
        db.add(spon1)
        db.commit()

        # 7. Seed Milestones for Challenge 1
        m1 = ProjectMilestone(
            id="m-101",
            challenge_id="JH-2026-0001",
            title="M1: Water Sample Analysis & Prototype Design",
            description="Testing village borewell water samples and finalizing column flow rates.",
            target_date="2026-09-15",
            status="COMPLETED",
            deliverables="Lab Test Report & CAD Design",
            assigned_members=["Aniket Sen", "Dr. Swati Sen"],
            completion_percentage=100
        )
        m2 = ProjectMilestone(
            id="m-102",
            challenge_id="JH-2026-0001",
            title="M2: Fabrication & IoT Sensor Integration",
            description="Assembling solar filter unit with real-time telemetry node.",
            target_date="2026-10-01",
            status="IN_PROGRESS",
            deliverables="Working Modular Kiosk Unit",
            assigned_members=["Priya Verma", "Rahul Mahato"],
            completion_percentage=60
        )
        m3 = ProjectMilestone(
            id="m-103",
            challenge_id="JH-2026-0001",
            title="M3: Field Pilot & Community Validation",
            description="Deploying unit in Angara village and conducting 30-day water quality trial.",
            target_date="2026-10-30",
            status="PENDING",
            deliverables="30-Day Water Quality Compliance Certification",
            assigned_members=["Aniket Sen", "Rohan Mahato"],
            completion_percentage=0
        )
        db.add_all([m1, m2, m3])

        # 8. Seed Outcome for Challenge 1
        outcome1 = InnovationOutcome(
            id="out-001",
            challenge_id="JH-2026-0001",
            patent_filed=True,
            patent_app_no="TEMP/2026/JH/884920",
            startup_incubated=True,
            startup_name="AquaPure Solutions Pvt Ltd",
            pilot_deployment_location="Angara Village, Ranchi",
            beneficiaries_count=1200,
            environmental_impact="Zero chemical waste discharge using solar bio-regeneration.",
            social_impact_summary="Eliminated fluoride levels from 4.2 mg/L down to WHO permissible 0.8 mg/L for 1,200 villagers.",
            cost_efficiency_notes="Cost per litre reduced to ₹0.08 vs commercial bottled water ₹15.00."
        )
        db.add(outcome1)
        db.commit()

        print("[SATARK AI Seed] Database successfully seeded with Jharkhand demo data!")
    except Exception as e:
        db.rollback()
        print(f"[SATARK AI Seed Error] {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
