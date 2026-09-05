from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Any

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class OTPSendRequest(BaseModel):
    target: str # Email or 10-digit mobile number
    type: str = "email" # "email" or "mobile"
    purpose: Optional[str] = "verification" # "signup", "login", "verification"

class OTPVerifyRequest(BaseModel):
    target: str # Email or 10-digit mobile number
    code: str

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    department_id: Optional[str] = None
    designation: Optional[str] = None
    institution_name: Optional[str] = None

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    department_id: Optional[str] = None
    designation: Optional[str] = None
    institution_name: Optional[str] = None
    active_issues_count: int = 0
    completed_issues_count: int = 0
    sla_compliance: float = 100.0
    avg_resolution_time: str = "1.5 days"
    status: str = "ACTIVE"

    class Config:
        from_attributes = True

# --- Challenge Schemas ---
class ChallengeCreate(BaseModel):
    title: str
    citizen_description: str
    image_url: Optional[str] = None
    latitude: float
    longitude: float
    address: str
    district: str
    category: Optional[str] = "Urban Infrastructure"

class ChallengeValidateRequest(BaseModel):
    department_id: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None
    override_reason: Optional[str] = None

class OverrideLogSchema(BaseModel):
    timestamp: str
    user_id: str
    user_name: str
    field: str
    old_value: str
    new_value: str
    reason: str

class ChallengeOut(BaseModel):
    id: str
    title: str
    citizen_description: str
    image_url: Optional[str] = None
    latitude: float
    longitude: float
    address: str
    district: str
    category: str
    sub_category: Optional[str] = None
    department_id: Optional[str] = None
    severity: str
    priority: str
    priority_score: int
    ai_confidence: float
    ai_reason: Optional[str] = None
    ai_reasoning_points: List[str] = []
    recommended_disciplines: List[str] = []
    status: str
    assigned_officer_id: Optional[str] = None
    assigned_university_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    sla_deadline: Optional[datetime] = None
    override_logs: List[Any] = []
    comments: List[Any] = []

    class Config:
        from_attributes = True

# --- AI Schemas ---
class AIAnalysisOut(BaseModel):
    challenge_id: str
    domain: str
    category: str
    sub_category: Optional[str] = None
    keywords: List[str] = []
    severity: str
    priority: str
    priority_score: int
    reasoning: str
    recommended_disciplines: List[str] = []
    recommended_solution_directions: List[str] = []

class UniversityMatchOut(BaseModel):
    university_id: str
    university_name: str
    match_score: int
    reasoning: str
    recommended_disciplines: List[str]
    is_demo_data: bool = True

# --- Proposal Schemas ---
class SolutionProposalCreate(BaseModel):
    challenge_id: str
    title: str
    abstract: str
    proposed_methodology: str
    technology_stack: List[str] = []
    faculty_lead_name: str
    student_members: List[str] = []
    estimated_cost_inr: float
    duration_months: int = 6

class SolutionProposalOut(BaseModel):
    id: str
    challenge_id: str
    university_id: str
    title: str
    abstract: str
    proposed_methodology: str
    technology_stack: List[str] = []
    faculty_lead_name: str
    student_members: List[str] = []
    estimated_cost_inr: float
    duration_months: int
    status: str
    submitted_at: datetime

    class Config:
        from_attributes = True

# --- Industry Schemas ---
class SponsorshipCreate(BaseModel):
    proposal_id: str
    organization_name: str
    partner_type: str = "CSR"
    contact_person: str
    funding_pledged_inr: float
    mentorship_provided: Optional[str] = None
    prototyping_support: bool = True
    equipment_support: Optional[str] = None

class SponsorshipOut(BaseModel):
    id: str
    proposal_id: str
    organization_name: str
    partner_type: str
    contact_person: str
    funding_pledged_inr: float
    mentorship_provided: Optional[str] = None
    prototyping_support: bool
    pledged_at: datetime
    is_demo_data: bool = True

    class Config:
        from_attributes = True

# --- Milestone & Impact Schemas ---
class MilestoneCreate(BaseModel):
    challenge_id: str
    title: str
    description: Optional[str] = None
    target_date: str
    deliverables: Optional[str] = None
    assigned_members: List[str] = []

class MilestoneUpdate(BaseModel):
    status: Optional[str] = None # PENDING, IN_PROGRESS, COMPLETED, DELAYED
    completion_percentage: Optional[int] = None

class ImpactReportCreate(BaseModel):
    challenge_id: str
    patent_filed: bool = False
    patent_app_no: Optional[str] = None
    startup_incubated: bool = False
    startup_name: Optional[str] = None
    pilot_deployment_location: Optional[str] = None
    beneficiaries_count: int = 0
    environmental_impact: Optional[str] = None
    social_impact_summary: Optional[str] = None
    cost_efficiency_notes: Optional[str] = None

# --- Dashboard Stats Schemas ---
class DashboardStatsOut(BaseModel):
    total_challenges: int
    new_challenges: int
    validated_challenges: int
    high_priority_count: int
    active_hei_projects: int
    industry_partnerships_count: int
    active_projects: int
    completed_projects: int
    total_funding_pledged_inr: float
    solutions_deployed: int
    patents_filed: int
    startups_created: int
    estimated_beneficiaries: int

# --- Prototype & Field Trial Schemas ---
class PrototypeSubmitRequest(BaseModel):
    challenge_id: str
    prototype_title: str
    fabrication_specs: str
    materials_used: Optional[str] = None
    fabrication_cost_inr: float = 0.0
    testing_metrics: Optional[str] = None
    student_team_lead: Optional[str] = "Aniket Sen (BIT Mesra)"

class OfficerAssignRequest(BaseModel):
    challenge_id: str
    officer_name: str
    officer_email: Optional[str] = None
    designation: Optional[str] = "Field Inspection Officer"
    assignment_notes: Optional[str] = None

class FieldReportSubmitRequest(BaseModel):
    challenge_id: str
    officer_name: str
    verification_status: str = "PASSED" # PASSED, FAILED, NEEDS_REVISION
    inspection_metrics: str
    field_notes: Optional[str] = None
    deployment_location: Optional[str] = None
    estimated_beneficiaries: int = 1000
    solved_image_proof: Optional[str] = None
    verification_pdf_proof: Optional[str] = None

