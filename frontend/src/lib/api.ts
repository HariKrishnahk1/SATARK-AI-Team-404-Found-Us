const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8008/api/v1';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('satark_jwt_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'API Error' }));
    throw new Error(err.detail || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data: any) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  // Challenges
  getChallenges: (params?: { district?: string; category?: string; priority?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchApi(`/challenges${query ? `?${query}` : ''}`);
  },
  getChallengeById: (id: string) => fetchApi(`/challenges/${id}`),
  createChallenge: (data: any) => fetchApi('/challenges', { method: 'POST', body: JSON.stringify(data) }),
  validateChallenge: (id: string, data: any) => fetchApi(`/challenges/${id}/validate`, { method: 'POST', body: JSON.stringify(data) }),
  getDuplicates: (id: string) => fetchApi(`/challenges/${id}/duplicates`, { method: 'POST' }),

  // HEIs
  getUniversities: () => fetchApi('/universities'),
  recommendUniversities: (challengeId: string) => fetchApi(`/universities/recommendations/${challengeId}`),
  assignUniversity: (challengeId: string, universityId: string) =>
    fetchApi(`/universities/assign?challenge_id=${challengeId}&university_id=${universityId}`, { method: 'POST' }),

  // Proposals
  getProposals: (challengeId?: string) => fetchApi(`/proposals${challengeId ? `?challenge_id=${challengeId}` : ''}`),
  createProposal: (data: any) => fetchApi('/proposals', { method: 'POST', body: JSON.stringify(data) }),

  // Industry
  getSponsorships: () => fetchApi('/industry/sponsorships'),
  pledgeSponsorship: (data: any) => fetchApi('/industry/sponsorships', { method: 'POST', body: JSON.stringify(data) }),

  // Projects & LifeCycle
  updateStatus: (challengeId: string, status: string) =>
    fetchApi(`/projects/${challengeId}/status?new_status=${status}`, { method: 'PATCH' }),
  createMilestone: (data: any) => fetchApi('/projects/milestones', { method: 'POST', body: JSON.stringify(data) }),
  recordImpact: (data: any) => fetchApi('/projects/impact', { method: 'POST', body: JSON.stringify(data) }),

  // Analytics & Notifications
  getStats: () => fetchApi('/analytics/stats'),
  getDomainDistribution: () => fetchApi('/analytics/domains'),
  getDistrictDistribution: () => fetchApi('/analytics/districts'),
  getNotifications: (role?: string) => fetchApi(`/notifications${role ? `?role=${role}` : ''}`),
  markNotificationRead: (id: string) => fetchApi(`/notifications/${id}/read`, { method: 'PATCH' })
};
