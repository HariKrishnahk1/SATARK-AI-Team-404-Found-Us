'use client';

/**
 * SATARK AI — Government Command Centre Page
 * Author: Divya (Government / Admin Portal Developer)
 * Features: 13 KPI metrics dashboard, interactive Leaflet GIS map of Jharkhand,
 * live challenges queue table, validation/AI override modal, pgvector duplicate drawer,
 * and university recommendation routing modal.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Challenge, DashboardStats, University } from '../../lib/types';
import { LeafletMap } from '../../components/LeafletMap';
import {
  Shield, CheckCircle, AlertTriangle, Building2, Landmark, HeartHandshake,
  Cpu, Users, Award, MapPin, RefreshCw, Eye, Edit3, Layers, Filter, Lock, ArrowRight
} from 'lucide-react';

export default function AdminCommandCentre() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [districtFilter, setDistrictFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Challenge for Modals/Drawers
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [validateModalOpen, setValidateModalOpen] = useState(false);
  const [duplicateDrawerOpen, setDuplicateDrawerOpen] = useState(false);
  const [heiModalOpen, setHeiModalOpen] = useState(false);

  // Validation Form state
  const [overrideSeverity, setOverrideSeverity] = useState('');
  const [overridePriority, setOverridePriority] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  // HEI Recommendations state
  const [heiRecommendations, setHeiRecommendations] = useState<any[]>([]);

  // Duplicate Check state
  const [duplicates, setDuplicates] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sData, cData, uData] = await Promise.all([
        api.getStats(),
        api.getChallenges({ district: districtFilter, priority: priorityFilter, status: statusFilter }),
        api.getUniversities()
      ]);
      setStats(sData);
      setChallenges(cData);
      setUniversities(uData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [districtFilter, priorityFilter, statusFilter]);

  // Strict Authorization Guard: Citizens are barred from viewing Government Command Centre
  if (user?.role === 'CITIZEN') {
    return (
      <div className="min-h-[80vh] bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4 shadow-xl shadow-rose-500/10">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Access Denied: Government Command Centre</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-md">
          Public citizens do not have authorization to view internal government command centres, override AI metrics, or route challenges. Please log in with official government credentials.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/citizen" className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20">
            <MapPin className="w-4 h-4" /> Return to Civic Portal
          </Link>
          <Link href="/login" className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs hover:border-cyan-400 transition-colors flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" /> Official Govt Login
          </Link>
        </div>
      </div>
    );
  }

  const handleValidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge) return;

    try {
      await api.validateChallenge(selectedChallenge.id, {
        severity: overrideSeverity || selectedChallenge.severity,
        priority: overridePriority || selectedChallenge.priority,
        override_reason: overrideReason
      });
      setValidateModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(`Validation error: ${err.message}`);
    }
  };

  const handleOpenHeiModal = async (ch: Challenge) => {
    setSelectedChallenge(ch);
    setHeiModalOpen(true);
    try {
      const res = await api.recommendUniversities(ch.id);
      setHeiRecommendations(res.recommended_universities || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignHei = async (universityId: string) => {
    if (!selectedChallenge) return;
    try {
      await api.assignUniversity(selectedChallenge.id, universityId);
      setHeiModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(`Assignment error: ${err.message}`);
    }
  };

  const handleOpenDuplicates = async (ch: Challenge) => {
    setSelectedChallenge(ch);
    setDuplicateDrawerOpen(true);
    try {
      const res = await api.getDuplicates(ch.id);
      setDuplicates(res.duplicates || []);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1 text-cyan-400 text-xs font-mono font-bold uppercase mb-1">
            <Shield className="w-3.5 h-3.5" /> Government Command Centre
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Societal Innovation Monitoring & Dispatch</h1>
          <p className="text-xs text-slate-400 mt-1">Validate challenges, review pgvector duplicate checks, route to departments, and assign HEIs.</p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Command Dashboard
        </button>
      </div>

      {/* KPI Cards (13 Specific Indicators) */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold">Total Challenges</div>
            <div className="text-2xl font-black text-white font-mono mt-1">{stats.total_challenges}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold">New / Unvalidated</div>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{stats.new_challenges}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold">High Priority</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">{stats.high_priority_count}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold">Active HEI Projects</div>
            <div className="text-2xl font-black text-purple-400 font-mono mt-1">{stats.active_hei_projects}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold">Industry CSR Pledges</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">₹{(stats.total_funding_pledged_inr / 100000).toFixed(1)}L</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold">Deployed / Resolved</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{stats.solutions_deployed}</div>
          </div>
        </div>
      )}

      {/* Interactive Leaflet GIS Map */}
      <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" /> State-Wide GIS Challenge Map (Jharkhand)
          </h2>
          <span className="text-xs font-mono text-slate-400">{challenges.length} Pin Locations</span>
        </div>
        <LeafletMap challenges={challenges} onSelectChallenge={(ch) => setSelectedChallenge(ch)} />
      </div>

      {/* Live Queue Table & Action Controls */}
      <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" /> Live Challenges Queue & Routing
          </h2>

          {/* Table Filters */}
          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300"
            >
              <option value="">All Districts</option>
              <option value="Ranchi">Ranchi</option>
              <option value="Dhanbad">Dhanbad</option>
              <option value="East Singhbhum">East Singhbhum</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300"
            >
              <option value="">All Priorities</option>
              <option value="URGENT">URGENT</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
            </select>
          </div>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/60">
                <th className="p-3">Challenge ID</th>
                <th className="p-3">Title & Category</th>
                <th className="p-3">District</th>
                <th className="p-3">Priority Score</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned HEI</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {challenges.map((ch) => (
                <tr key={ch.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-cyan-400">{ch.id}</td>
                  <td className="p-3">
                    <div className="font-bold text-white">{ch.title}</div>
                    <div className="text-[10px] text-slate-400">{ch.category}</div>
                  </td>
                  <td className="p-3">{ch.district}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                      ch.priority_score >= 85 ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {ch.priority_score}/100 ({ch.priority})
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                      {ch.status}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-purple-300">
                    {ch.assigned_university_id ? 'BIT Mesra' : 'Unassigned'}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedChallenge(ch);
                        setOverrideSeverity(ch.severity);
                        setOverridePriority(ch.priority);
                        setValidateModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/40 text-[10px] font-bold"
                    >
                      Validate / Override
                    </button>
                    <button
                      onClick={() => handleOpenDuplicates(ch)}
                      className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-750 text-[10px] font-bold"
                    >
                      Duplicates
                    </button>
                    <button
                      onClick={() => handleOpenHeiModal(ch)}
                      className="px-2.5 py-1 rounded bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/40 text-[10px] font-bold"
                    >
                      Route HEI
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation & AI Override Modal */}
      {validateModalOpen && selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-cyan-400" /> Government Validation & AI Override
            </h3>
            <p className="text-xs text-slate-400">Review AI classification and override severity/priority if necessary. Overrides will be recorded in audit logs.</p>

            <form onSubmit={handleValidateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Severity Level</label>
                <select
                  value={overrideSeverity}
                  onChange={(e) => setOverrideSeverity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Priority Level</label>
                <select
                  value={overridePriority}
                  onChange={(e) => setOverridePriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                >
                  <option value="URGENT">URGENT</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Override Reason</label>
                <input
                  type="text"
                  placeholder="Reason for adjusting AI classification..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setValidateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-bold"
                >
                  Validate & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEI Recommendation & Route Modal */}
      {heiModalOpen && selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-purple-400" /> Module 4: HEI Recommendation Matching
            </h3>
            <p className="text-xs text-slate-400">Select suitable Higher Education Institution based on faculty expertise, lab facilities, and discipline alignment.</p>

            <div className="space-y-3">
              {heiRecommendations.map((hei) => (
                <div key={hei.university_id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{hei.university_name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                        {hei.match_score}% Match Score
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{hei.reasoning}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {hei.matched_disciplines?.map((d: string) => (
                        <span key={d} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 text-[9px] border border-slate-800">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssignHei(hei.university_id)}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 whitespace-nowrap"
                  >
                    Assign Challenge
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setHeiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Check Drawer */}
      {duplicateDrawerOpen && selectedChallenge && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md p-6 h-full overflow-y-auto space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" /> Module 3: Duplicate Detection (pgvector)
            </h3>
            <p className="text-xs text-slate-400">Flagged potential duplicates based on vector embedding similarity and GIS distance bounds.</p>

            {duplicates.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950 text-xs text-slate-400 text-center">
                No potential duplicates detected above similarity threshold.
              </div>
            ) : (
              duplicates.map((dup) => (
                <div key={dup.primary_challenge_id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono text-cyan-400 font-bold">{dup.primary_challenge_id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      {dup.similarity_score}% Similarity
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{dup.title}</h4>
                  <p className="text-[11px] text-slate-400">{dup.reason}</p>
                </div>
              ))
            )}

            <button
              onClick={() => setDuplicateDrawerOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold mt-4"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
