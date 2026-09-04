'use client';

/**
 * SATARK AI — Government Command Centre Page
 * Author: Divya (Government / Admin Portal Developer)
 * Features: 13 KPI metrics dashboard, interactive Leaflet GIS map of Jharkhand,
 * live challenges queue table, validation/AI override modal, pgvector duplicate drawer,
 * and university recommendation routing modal.
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Challenge, DashboardStats, University } from '../../lib/types';
import { LeafletMap } from '../../components/LeafletMap';
import {
  Shield, CheckCircle, AlertTriangle, Building2, Landmark, HeartHandshake,
  Cpu, Users, Award, MapPin, RefreshCw, Eye, Edit3, Layers, Filter, UserCheck, FileText, CheckCircle2, ClipboardCheck
} from 'lucide-react';

export default function AdminCommandCentre() {
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

  // Field Officer Assignment & Verification Report Modals
  const [officerModalOpen, setOfficerModalOpen] = useState(false);
  const [fieldReportModalOpen, setFieldReportModalOpen] = useState(false);

  // Officer Assignment Form state
  const [assignedOfficerName, setAssignedOfficerName] = useState('Er. Vikram Kumar (Junior Engineer, Roads & Water)');
  const [assignmentNotes, setAssignmentNotes] = useState('Conduct on-site inspection for prototype durability, flow safety, and community impact.');

  // Field Report Form state
  const [verificationStatus, setVerificationStatus] = useState('PASSED');
  const [inspectionMetrics, setInspectionMetrics] = useState('Field Trial Inspection Passed: Arsenic filtration efficiency verified at 98.4%, 120 L/hr discharge rate, structural casing sturdy.');
  const [fieldNotes, setFieldNotes] = useState('Recommended for full deployment across target panchayats.');
  const [deploymentLocation, setDeploymentLocation] = useState('Ranchi Gram Panchayat Kiosk');
  const [beneficiaries, setBeneficiaries] = useState(1250);
  const [solvedImageUrl, setSolvedImageUrl] = useState<string>('');
  const [inspectionPdfUrl, setInspectionPdfUrl] = useState<string>('');
  const [pdfName, setPdfName] = useState<string>('');

  const handleSolvedImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file for problem solved proof.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) setSolvedImageUrl(e.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInspectionPdfSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Please select a valid PDF file for the verification report.');
      return;
    }
    setPdfName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) setInspectionPdfUrl(e.target.result as string);
    };
    reader.readAsDataURL(file);
  };

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

  const handleAssignOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge) return;

    try {
      await api.assignFieldOfficer({
        challenge_id: selectedChallenge.id,
        officer_name: assignedOfficerName,
        assignment_notes: assignmentNotes
      });
      setOfficerModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(`Officer assignment error: ${err.message}`);
    }
  };

  const handleSubmitFieldReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge) return;

    try {
      await api.submitFieldReport({
        challenge_id: selectedChallenge.id,
        officer_name: assignedOfficerName,
        verification_status: verificationStatus,
        inspection_metrics: inspectionMetrics,
        field_notes: fieldNotes,
        deployment_location: deploymentLocation,
        estimated_beneficiaries: Number(beneficiaries),
        solved_image_proof: solvedImageUrl,
        verification_pdf_proof: inspectionPdfUrl || 'SATARK_Official_Verification_Report.pdf'
      });
      setFieldReportModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(`Field report submission error: ${err.message}`);
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
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="SATARK AI Logo" className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0" />
          <div>
            <div className="inline-flex items-center gap-1 text-cyan-400 text-xs font-mono font-bold uppercase mb-1">
              <Shield className="w-3.5 h-3.5" /> Government Command Centre
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Societal Innovation Monitoring & Dispatch</h1>
            <p className="text-xs text-slate-400 mt-1">Validate challenges, review pgvector duplicate checks, route to departments, and assign HEIs.</p>
          </div>
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
            <MapPin className="w-4 h-4 text-emerald-400" /> Pan-India Interactive GIS Challenge Map
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
                  <td className="p-3 text-right space-x-1.5 flex justify-end items-center">
                    <button
                      onClick={() => {
                        setSelectedChallenge(ch);
                        setOverrideSeverity(ch.severity);
                        setOverridePriority(ch.priority);
                        setValidateModalOpen(true);
                      }}
                      className="px-2 py-1 rounded bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/40 text-[10px] font-bold"
                    >
                      Validate
                    </button>
                    <button
                      onClick={() => handleOpenHeiModal(ch)}
                      className="px-2 py-1 rounded bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/40 text-[10px] font-bold"
                    >
                      Route HEI
                    </button>

                    {/* Field Officer Assignment Box Action */}
                    <button
                      onClick={() => {
                        setSelectedChallenge(ch);
                        setOfficerModalOpen(true);
                      }}
                      className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/40 text-[10px] font-bold flex items-center gap-1"
                    >
                      <UserCheck className="w-3 h-3" />
                      Assign Officer
                    </button>

                    {/* Field Inspection Report Action */}
                    <button
                      onClick={() => {
                        setSelectedChallenge(ch);
                        setFieldReportModalOpen(true);
                      }}
                      className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/40 text-[10px] font-bold flex items-center gap-1"
                    >
                      <ClipboardCheck className="w-3 h-3" />
                      Field Report
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
      {officerModalOpen && selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-400" /> Government Field Officer Assignment Box
            </h3>
            <p className="text-xs text-slate-400">
              Assign a dedicated departmental field officer to conduct on-site trial verification for prototype: <span className="text-white font-semibold">'{selectedChallenge.title}'</span>.
            </p>

            <form onSubmit={handleAssignOfficer} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Designated Field Inspection Officer Name</label>
                <input
                  type="text"
                  required
                  value={assignedOfficerName}
                  onChange={(e) => setAssignedOfficerName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  placeholder="e.g. Er. Vikram Kumar (Junior Engineer)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Inspection Directives & Field Trial Notes</label>
                <textarea
                  rows={3}
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  placeholder="Directives for field inspection check..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOfficerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20"
                >
                  Assign Officer for Pilot Trial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Field Inspection & Verification Report Modal */}
      {fieldReportModalOpen && selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-emerald-400" /> Field Verification Report Submission Box
            </h3>
            <p className="text-xs text-slate-400">
              Submit field inspection findings for <span className="text-white font-semibold">'{selectedChallenge.title}'</span>. Submitting approval will mark the project <span className="text-emerald-400 font-bold">DEPLOYED & RESOLVED</span> and update the Citizen Portal checkboxes.
            </p>

            <form onSubmit={handleSubmitFieldReport} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Reporting Officer Name</label>
                  <input
                    type="text"
                    required
                    value={assignedOfficerName}
                    onChange={(e) => setAssignedOfficerName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Field Trial Verification Outcome</label>
                  <select
                    value={verificationStatus}
                    onChange={(e) => setVerificationStatus(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 text-xs font-bold"
                  >
                    <option value="PASSED">PASSED / VERIFIED & APPROVED</option>
                    <option value="NEEDS_REVISION">NEEDS FIELD REVISION</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">On-Site Field Trial Metrics & Performance</label>
                <textarea
                  rows={3}
                  required
                  value={inspectionMetrics}
                  onChange={(e) => setInspectionMetrics(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  placeholder="Record trial metrics, flow rate, purity efficiency, safety check outcome..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Deployment Location</label>
                  <input
                    type="text"
                    required
                    value={deploymentLocation}
                    onChange={(e) => setDeploymentLocation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Estimated Community Beneficiaries</label>
                  <input
                    type="number"
                    required
                    value={beneficiaries}
                    onChange={(e) => setBeneficiaries(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              {/* Solved Proof Attachments: Image & PDF */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    📷 Problem Solved Image Proof *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && e.target.files[0] && handleSolvedImageSelect(e.target.files[0])}
                    className="w-full text-[11px] text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30 cursor-pointer"
                  />
                  {solvedImageUrl ? (
                    <div className="flex items-center gap-2 mt-1.5">
                      <img src={solvedImageUrl} alt="Solved Proof Preview" className="w-12 h-12 object-cover rounded-lg border border-emerald-500/40" />
                      <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Photo Proof Attached
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 block mt-1">No Photo Proof Attached Yet</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    📄 Field Verification Report (PDF Proof) *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => e.target.files && e.target.files[0] && handleInspectionPdfSelect(e.target.files[0])}
                    className="w-full text-[11px] text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 cursor-pointer"
                  />
                  {pdfName ? (
                    <span className="text-[10px] text-emerald-300 font-mono font-semibold block mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> PDF Attached: {pdfName}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 block mt-1">No PDF Document Attached Yet</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFieldReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20"
                >
                  Submit Inspection Report & Resolve Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
