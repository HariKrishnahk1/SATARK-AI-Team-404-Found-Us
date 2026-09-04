'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../lib/types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerCitizen: (data: { name: string; email: string; mobile: string; address?: string; password?: string; avatar_url?: string }) => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  switchDemoRole: (role: Role) => void;
  logout: () => void;
}

const DEMO_USERS: Record<Role, User> = {
  SUPER_ADMIN: { id: 'u-admin', name: 'Aakash Sharma', email: 'admin@satark.gov.in', role: 'SUPER_ADMIN', designation: 'Director General', institution_name: 'National Directorate of Higher & Tech Education', mobile: '+91 94311 00212', address: 'Secretariat Complex, Dhurwa, Ranchi - 834004' },
  CITIZEN: { id: 'u-citizen', name: 'Rohan Mahato', email: 'citizen@satark.gov.in', role: 'CITIZEN', designation: 'Community Representative', institution_name: 'Ranchi Gram Panchayat', mobile: '+91 98765 43210', address: 'Flat 402, Shanti Vihar, Harmu Housing Colony, Ranchi, Jharkhand - 834002', avatar_url: '/logo.png' },
  DEPARTMENT_HEAD: { id: 'u-depthead', name: 'Er. Ramesh Prasad', email: 'depthead@satark.gov.in', role: 'DEPARTMENT_HEAD', designation: 'Chief Engineer (Water Resources)', mobile: '+91 94311 88401', address: 'Engineers Hostel, Doranda, Ranchi - 834002' },
  OFFICER: { id: 'u-officer', name: 'Vikram Kumar', email: 'officer@satark.gov.in', role: 'OFFICER', designation: 'Junior Engineer (Roads)', mobile: '+91 91223 44556', address: 'PWD Sub-Division Office, Hazaribagh' },
  HEI_COORDINATOR: { id: 'u-hei', name: 'Dr. R. K. Sharma', email: 'hei@bitmesra.ac.in', role: 'HEI_COORDINATOR', designation: 'Dean of R&D', institution_name: 'BIT Mesra', mobile: '+91 65122 75444', address: 'BIT Mesra Campus, Ranchi - 835215' },
  FACULTY_MENTOR: { id: 'u-faculty', name: 'Dr. Swati Sen', email: 'faculty@bitmesra.ac.in', role: 'FACULTY_MENTOR', designation: 'Associate Professor', institution_name: 'BIT Mesra', mobile: '+91 65122 75445', address: 'Faculty Quarters, BIT Mesra' },
  STUDENT_TEAM: { id: 'u-student', name: 'Aniket Sen (Team Lead)', email: 'student@bitmesra.ac.in', role: 'STUDENT_TEAM', designation: 'Final Year Innovator', institution_name: 'BIT Mesra', mobile: '+91 88776 65544', address: 'Hostel 11, BIT Mesra Campus, Ranchi' },
  INDUSTRY_PARTNER: { id: 'u-industry', name: 'Sanjay Chatterji', email: 'csr@tatasteel.com', role: 'INDUSTRY_PARTNER', designation: 'Head of Social Innovation', institution_name: 'Tata Steel CSR', mobile: '+91 65722 22000', address: 'Tata Steel Foundation, Jamshedpur - 831001' },
  CSR_PARTNER: { id: 'u-csr', name: 'Meera Nair', email: 'csr@coalindia.in', role: 'CSR_PARTNER', designation: 'GM CSR', institution_name: 'Coal India R&D Foundation', mobile: '+91 33232 46666', address: 'Coal Bhawan, Newtown, Kolkata' }
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoadingAuth: true,
  login: async () => {},
  registerCitizen: async () => {},
  updateProfile: () => {},
  switchDemoRole: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('satark_user');
      const savedToken = localStorage.getItem('satark_jwt_token');
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (e) {
      setUser(null);
      setToken(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password);
      setUser(data.user);
      setToken(data.access_token);
      localStorage.setItem('satark_user', JSON.stringify(data.user));
      localStorage.setItem('satark_jwt_token', data.access_token);
    } catch (e) {
      const matchedRole = (Object.keys(DEMO_USERS) as Role[]).find(r => DEMO_USERS[r].email === email) || 'SUPER_ADMIN';
      const demoU = DEMO_USERS[matchedRole];
      setUser(demoU);
      setToken('demo-token');
      localStorage.setItem('satark_user', JSON.stringify(demoU));
      localStorage.setItem('satark_jwt_token', 'demo-token');
    }
  };

  const updateProfile = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      try {
        localStorage.setItem('satark_user', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const registerCitizen = async (data: { name: string; email: string; mobile: string; address?: string; password?: string; avatar_url?: string }) => {
    const newUser: User = {
      id: `u-cit-${Date.now().toString(36)}`,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      address: data.address || 'Jharkhand, India',
      avatar_url: data.avatar_url || '/logo.png',
      role: 'CITIZEN',
      designation: 'Verified Citizen Contributor',
      institution_name: 'Jharkhand Civic Community',
      active_issues_count: 0,
      completed_issues_count: 0,
      status: 'VERIFIED'
    };
    try {
      await api.register({
        name: data.name,
        email: data.email,
        password: data.password || 'password123',
        role: 'CITIZEN'
      });
    } catch (e) {
      // Offline / demo fallback
    }
    setUser(newUser);
    setToken('citizen-token-' + Date.now());
    try {
      localStorage.setItem('satark_user', JSON.stringify(newUser));
      localStorage.setItem('satark_jwt_token', 'citizen-token-' + Date.now());
    } catch (e) {}
  };

  const switchDemoRole = (role: Role) => {
    const demoU = DEMO_USERS[role];
    setUser(demoU);
    setToken('demo-token');
    localStorage.setItem('satark_user', JSON.stringify(demoU));
    localStorage.setItem('satark_jwt_token', 'demo-token');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('satark_user');
    localStorage.removeItem('satark_jwt_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoadingAuth, login, registerCitizen, updateProfile, switchDemoRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
