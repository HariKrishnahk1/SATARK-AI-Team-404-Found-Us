from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False) # CITIZEN, SUPER_ADMIN, DEPARTMENT_HEAD, OFFICER, HEI_COORDINATOR, FACULTY_MENTOR, STUDENT_TEAM, INDUSTRY_PARTNER, CSR_PARTNER
    department_id = Column(String, ForeignKey("departments.id"), nullable=True)
    designation = Column(String, nullable=True)
    employee_id = Column(String, nullable=True)
    institution_name = Column(String, nullable=True)
    active_issues_count = Column(Integer, default=0)
    completed_issues_count = Column(Integer, default=0)
    sla_compliance = Column(Float, default=100.0)
    avg_resolution_time = Column(String, default="1.5 days")
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    department = relationship("Department", back_populates="officers")

class Department(Base):
    __tablename__ = "departments"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    responsible_area = Column(String, nullable=True)
    head_name = Column(String, nullable=True)
    status = Column(String, default="ACTIVE")
    sla_critical_hours = Column(Integer, default=24)
    sla_high_hours = Column(Integer, default=72)
    sla_medium_hours = Column(Integer, default=168)
    sla_low_hours = Column(Integer, default=336)

    officers = relationship("User", back_populates="department")
    challenges = relationship("Challenge", back_populates="department")

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    citizen_description = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String, nullable=False)
    district = Column(String, nullable=False, index=True) # Ranchi, Dhanbad, East Singhbhum, Bokaro, etc.
    category = Column(String, nullable=False)
    sub_category = Column(String, nullable=True)
    department_id = Column(String, ForeignKey("departments.id"), nullable=True)
    
    severity = Column(String, default="MEDIUM") # CRITICAL, HIGH, MEDIUM, LOW
    priority = Column(String, default="MEDIUM") # URGENT, HIGH, MEDIUM, LOW
    priority_score = Column(Integer, default=50) # 0 - 100
    ai_confidence = Column(Float, default=85.0)
    ai_reason = Column(Text, nullable=True)
    ai_reasoning_points = Column(JSON, default=list)
    recommended_disciplines = Column(JSON, default=list)
    
    status = Column(
        String,
        default="REPORTED"
    ) # REPORTED, AI_ANALYZED, GOVERNMENT_VALIDATED, ROUTED, ASSIGNED, HEI_ASSIGNED, TEAM_FORMED, PROPOSAL_SUBMITTED, PROPOSAL_APPROVED, INDUSTRY_SPONSORED, PROTOTYPE_DEVELOPMENT, PILOT_DEPLOYMENT, IMPACT_VALIDATED, RESOLVED
    
    assigned_officer_id = Column(String, ForeignKey("users.id"), nullable=True)
    assigned_university_id = Column(String, ForeignKey("universities.id"), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    sla_deadline = Column(DateTime, nullable=True)
    
    # Overrides and audit
    override_logs = Column(JSON, default=list)
    comments = Column(JSON, default=list)
    duplicate_group_id = Column(String, nullable=True)

    # Relationships
    department = relationship("Department", back_populates="challenges")
    assigned_university = relationship("University", back_populates="challenges")
    ai_analysis = relationship("AIAnalysis", back_populates="challenge", uselist=False)
    proposals = relationship("SolutionProposal", back_populates="challenge")
    milestones = relationship("ProjectMilestone", back_populates="challenge")
    outcome = relationship("InnovationOutcome", back_populates="challenge", uselist=False)

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(String, primary_key=True, default=generate_uuid)
    challenge_id = Column(String, ForeignKey("challenges.id"), nullable=False)
    domain = Column(String, nullable=False)
    category = Column(String, nullable=False)
    sub_category = Column(String, nullable=True)
    keywords = Column(JSON, default=list)
    severity = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    priority_score = Column(Integer, nullable=False)
    reasoning = Column(Text, nullable=False)
    recommended_disciplines = Column(JSON, default=list)
    recommended_solution_directions = Column(JSON, default=list)
    vector_embedding = Column(JSON, nullable=True) # Serialized embedding array for fallback/pgvector
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    challenge = relationship("Challenge", back_populates="ai_analysis")

class ChallengeDuplicate(Base):
    __tablename__ = "challenge_duplicates"

    id = Column(String, primary_key=True, default=generate_uuid)
    primary_challenge_id = Column(String, ForeignKey("challenges.id"), nullable=False)
    similar_challenge_id = Column(String, ForeignKey("challenges.id"), nullable=False)
    similarity_score = Column(Float, nullable=False) # e.g. 0.87
    distance_meters = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, default="FLAGGED") # FLAGGED, CONFIRMED, MERGED, REJECTED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class University(Base):
    __tablename__ = "universities"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False) # e.g. BIT Mesra, NIT Jamshedpur, IIT ISM Dhanbad
    district = Column(String, nullable=False)
    disciplines = Column(JSON, default=list) # Civil Engg, Environmental Engg, Computer Science, etc.
    faculty_count = Column(Integer, default=50)
    lab_facilities = Column(JSON, default=list)
    innovation_centres = Column(JSON, default=list)
    past_projects_count = Column(Integer, default=12)
    contact_email = Column(String, nullable=False)
    is_demo_data = Column(Boolean, default=True)

    challenges = relationship("Challenge", back_populates="assigned_university")
    proposals = relationship("SolutionProposal", back_populates="university")

class SolutionProposal(Base):
    __tablename__ = "solution_proposals"

    id = Column(String, primary_key=True, default=generate_uuid)
    challenge_id = Column(String, ForeignKey("challenges.id"), nullable=False)
    university_id = Column(String, ForeignKey("universities.id"), nullable=False)
    title = Column(String, nullable=False)
    abstract = Column(Text, nullable=False)
    proposed_methodology = Column(Text, nullable=False)
    technology_stack = Column(JSON, default=list)
    faculty_lead_name = Column(String, nullable=False)
    student_members = Column(JSON, default=list)
    estimated_cost_inr = Column(Float, nullable=False) # INR Funding
    duration_months = Column(Integer, default=6)
    status = Column(String, default="SUBMITTED") # DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, FUNDED, REJECTED
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    challenge = relationship("Challenge", back_populates="proposals")
    university = relationship("University", back_populates="proposals")
    sponsorships = relationship("IndustrySponsorship", back_populates="proposal")

class IndustrySponsorship(Base):
    __tablename__ = "industry_sponsorships"

    id = Column(String, primary_key=True, default=generate_uuid)
    proposal_id = Column(String, ForeignKey("solution_proposals.id"), nullable=False)
    organization_name = Column(String, nullable=False) # Tata Steel CSR, Coal India R&D, etc.
    partner_type = Column(String, default="CSR") # CSR, INDUSTRY, STARTUP, MSME
    contact_person = Column(String, nullable=False)
    funding_pledged_inr = Column(Float, default=0.0)
    mentorship_provided = Column(Text, nullable=True)
    prototyping_support = Column(Boolean, default=True)
    equipment_support = Column(Text, nullable=True)
    pledged_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_demo_data = Column(Boolean, default=True)

    proposal = relationship("SolutionProposal", back_populates="sponsorships")

class ProjectMilestone(Base):
    __tablename__ = "project_milestones"

    id = Column(String, primary_key=True, default=generate_uuid)
    challenge_id = Column(String, ForeignKey("challenges.id"), nullable=False)
    title = Column(String, nullable=False) # M1 Research, M2 Prototype, M3 Testing, M4 Pilot
    description = Column(Text, nullable=True)
    target_date = Column(String, nullable=False)
    status = Column(String, default="PENDING") # PENDING, IN_PROGRESS, COMPLETED, DELAYED
    deliverables = Column(Text, nullable=True)
    assigned_members = Column(JSON, default=list)
    completion_percentage = Column(Integer, default=0)

    challenge = relationship("Challenge", back_populates="milestones")

class InnovationOutcome(Base):
    __tablename__ = "innovation_outcomes"

    id = Column(String, primary_key=True, default=generate_uuid)
    challenge_id = Column(String, ForeignKey("challenges.id"), nullable=False)
    patent_filed = Column(Boolean, default=False)
    patent_app_no = Column(String, nullable=True)
    startup_incubated = Column(Boolean, default=False)
    startup_name = Column(String, nullable=True)
    pilot_deployment_location = Column(String, nullable=True)
    beneficiaries_count = Column(Integer, default=0)
    environmental_impact = Column(Text, nullable=True)
    social_impact_summary = Column(Text, nullable=True)
    cost_efficiency_notes = Column(Text, nullable=True)
    solved_image_url = Column(Text, nullable=True)
    verification_pdf_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    challenge = relationship("Challenge", back_populates="outcome")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user_id = Column(String, nullable=False)
    user_name = Column(String, nullable=False)
    user_role = Column(String, nullable=False)
    action = Column(String, nullable=False)
    challenge_id = Column(String, nullable=True)
    previous_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String, nullable=False)
    target_role = Column(String, nullable=True) # e.g. SUPER_ADMIN, HEI_COORDINATOR, INDUSTRY_PARTNER
    challenge_id = Column(String, nullable=True)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
