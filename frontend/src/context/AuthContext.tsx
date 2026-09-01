'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../lib/types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  switchDemoRole: (role: Role) => void;
  logout: () => void;
}

const DEMO_USERS: Record<Role, User> = {
  SUPER_ADMIN: { id: 'u-admin', name: 'Aakash Sharma', email: 'admin@satark.gov.in', role: 'SUPER_ADMIN', designation: 'State Director', institution_name: 'Dept of Higher & Tech Education, Jharkhand' },
  CITIZEN: { id: 'u-citizen', name: 'Rohan Mahato', email: 'citizen@satark.gov.in', role: 'CITIZEN', designation: 'Community Representative', institution_name: 'Ranchi Gram Panchayat' },
  DEPARTMENT_HEAD: { id: 'u-depthead', name: 'Er. Ramesh Prasad', email: 'depthead@satark.gov.in', role: 'DEPARTMENT_HEAD', designation: 'Chief Engineer (Water Resources)' },
  OFFICER: { id: 'u-officer', name: 'Vikram Kumar', email: 'officer@satark.gov.in', role: 'OFFICER', designation: 'Junior Engineer (Roads)' },
  HEI_COORDINATOR: { id: 'u-hei', name: 'Dr. R. K. Sharma', email: 'hei@bitmesra.ac.in', role: 'HEI_COORDINATOR', designation: 'Dean of R&D', institution_name: 'BIT Mesra' },
  FACULTY_MENTOR: { id: 'u-faculty', name: 'Dr. Swati Sen', email: 'faculty@bitmesra.ac.in', role: 'FACULTY_MENTOR', designation: 'Associate Professor', institution_name: 'BIT Mesra' },
  STUDENT_TEAM: { id: 'u-student', name: 'Aniket Sen (Team Lead)', email: 'student@bitmesra.ac.in', role: 'STUDENT_TEAM', designation: 'Final Year Innovator', institution_name: 'BIT Mesra' },
  INDUSTRY_PARTNER: { id: 'u-industry', name: 'Sanjay Chatterji', email: 'csr@tatasteel.com', role: 'INDUSTRY_PARTNER', designation: 'Head of Social Innovation', institution_name: 'Tata Steel CSR' },
  CSR_PARTNER: { id: 'u-csr', name: 'Meera Nair', email: 'csr@coalindia.in', role: 'CSR_PARTNER', designation: 'GM CSR', institution_name: 'Coal India R&D Foundation' }
};

const AuthContext = createContext<AuthContextType>({
  user: DEMO_USERS.SUPER_ADMIN,
  token: 'demo-token',
  login: async () => {},
  switchDemoRole: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(DEMO_USERS.SUPER_ADMIN);
  const [token, setToken] = useState<string | null>('demo-token');

  useEffect(() => {
    const savedUser = localStorage.getItem('satark_user');
    const savedToken = localStorage.getItem('satark_jwt_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        setUser(DEMO_USERS.SUPER_ADMIN);
      }
    } else {
      setUser(DEMO_USERS.SUPER_ADMIN);
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
    <AuthContext.Provider value={{ user, token, login, switchDemoRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
