export type Role =
  | 'CITIZEN'
  | 'SUPER_ADMIN'
  | 'DEPARTMENT_HEAD'
  | 'OFFICER'
  | 'HEI_COORDINATOR'
  | 'FACULTY_MENTOR'
  | 'STUDENT_TEAM'
  | 'INDUSTRY_PARTNER'
  | 'CSR_PARTNER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department_id?: string;
  designation?: string;
  institution_name?: string;
  active_issues_count?: number;
  completed_issues_count?: number;
  sla_compliance?: number;
  avg_resolution_time?: string;
  status?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  responsible_area: string;
  head_name: string;
}

export interface Challenge {
  id: string;
  title: string;
  citizen_description: string;
  image_url?: string;
  latitude: number;
  longitude: number;
  address: string;
  district: string;
  category: string;
  sub_category?: string;
  department_id?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  priority_score: number;
  ai_confidence: number;
  ai_reason?: string;
  ai_reasoning_points?: string[];
  recommended_disciplines?: string[];
  status:
    | 'REPORTED'
    | 'AI_ANALYZED'
    | 'GOVERNMENT_VALIDATED'
    | 'ROUTED'
    | 'ASSIGNED'
    | 'HEI_ASSIGNED'
    | 'TEAM_FORMED'
    | 'PROPOSAL_SUBMITTED'
    | 'PROPOSAL_APPROVED'
    | 'INDUSTRY_SPONSORED'
    | 'PROTOTYPE_DEVELOPMENT'
    | 'PROTOTYPE_BUILT'
    | 'PILOT_DEPLOYMENT'
    | 'IMPACT_VALIDATED'
    | 'RESOLVED';
  assigned_officer_id?: string;
  assigned_university_id?: string;
  created_at: string;
  updated_at: string;
  sla_deadline?: string;
  override_logs?: any[];
  comments?: any[];
  solved_image_proof?: string;
  verification_pdf_proof?: string;
}

export interface University {
  id: string;
  name: string;
  district: string;
  disciplines: string[];
  faculty_count: number;
  lab_facilities: string[];
  innovation_centres: string[];
  past_projects_count: number;
  contact_email: string;
  is_demo_data: boolean;
}

export interface SolutionProposal {
  id: string;
  challenge_id: string;
  university_id: string;
  title: string;
  abstract: string;
  proposed_methodology: string;
  technology_stack: string[];
  faculty_lead_name: string;
  student_members: string[];
  estimated_cost_inr: number;
  duration_months: number;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'FUNDED' | 'REJECTED';
  submitted_at: string;
}

export interface IndustrySponsorship {
  id: string;
  proposal_id: string;
  organization_name: string;
  partner_type: 'CSR' | 'INDUSTRY' | 'STARTUP' | 'MSME';
  contact_person: string;
  funding_pledged_inr: number;
  mentorship_provided?: string;
  prototyping_support: boolean;
  equipment_support?: string;
  pledged_at: string;
  is_demo_data: boolean;
}

export interface ProjectMilestone {
  id: string;
  challenge_id: string;
  title: string;
  description?: string;
  target_date: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  deliverables?: string;
  assigned_members?: string[];
  completion_percentage?: number;
}

export interface DashboardStats {
  total_challenges: number;
  new_challenges: number;
  validated_challenges: number;
  high_priority_count: number;
  active_hei_projects: number;
  industry_partnerships_count: number;
  active_projects: number;
  completed_projects: number;
  total_funding_pledged_inr: number;
  solutions_deployed: number;
  patents_filed: number;
  startups_created: number;
  estimated_beneficiaries: number;
}
