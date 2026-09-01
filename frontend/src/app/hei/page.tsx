'use client';

/**
 * SATARK AI — University & HEI Portal Page
 * Author: Deepika (University / HEI Portal Developer)
 * Features: Assigned challenges view, student innovation team formation,
 * faculty lead assignment, solution proposal creation with INR budget,
 * and project milestone progress tracking.
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Challenge, SolutionProposal } from '../../lib/types';
import { Landmark, Users, Send, CheckCircle, FileText, Plus, Sparkles, Award } from 'lucide-react';

export default function UniversityPortal() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [proposals, setProposals] = useState<SolutionProposal[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Proposal Form state
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [methodology, setMethodology] = useState('');
  const [facultyLead, setFacultyLead] = useState('Dr. Swati Sen (BIT Mesra)');
  const [students, setStudents] = useState('Aniket Sen, Priya Verma, Rahul Mahato');
  const [techStack, setTechStack] = useState('IoT Sensors, Solar Photovoltaics, Chemical Adsorption');
  const [budgetINR, setBudgetINR] = useState(350000);
  const [durationMonths, setDurationMonths] = useState(6);
  const [proposalSubmitted, setProposalSubmitted] = useState(false);

  const loadData = async () => {
    try {
      const [cData, pData] = await Promise.all([
        api.getChallenges(),
        api.getProposals()
      ]);
      setChallenges(cData);
      setProposals(pData);
      if (cData.length > 0 && !selectedChallenge) {
        setSelectedChallenge(cData[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge || !title || !abstract) return;

    try {
      await api.createProposal({
        challenge_id: selectedChallenge.id,
        title,
        abstract,
        proposed_methodology: methodology,
        technology_stack: techStack.split(',').map(s => s.trim()),
        faculty_lead_name: facultyLead,
        student_members: students.split(',').map(s => s.trim()),
        estimated_cost_inr: budgetINR,
        duration_months: durationMonths
      });

      setProposalSubmitted(true);
      loadData();
    } catch (err: any) {
      alert(`Proposal error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1 text-purple-400 text-xs font-mono font-bold uppercase mb-1">
            <Landmark className="w-3.5 h-3.5" /> University & HEI Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Student Innovation & Research Hub</h1>
          <p className="text-xs text-slate-400 mt-1">Form multidisciplinary student-faculty teams, submit solution proposals, build prototypes, and report impact.</p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
          BIT Mesra • R&D Cell
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Assigned Challenges List */}
        <div className="lg:col-span-4 bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" /> Assigned Challenges
          </h2>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {challenges.map(ch => (
              <div
                key={ch.id}
                onClick={() => {
                  setSelectedChallenge(ch);
                  setTitle(`Solar De-Fluoridation & IoT Monitoring Kiosk for ${ch.district}`);
                  setAbstract(`Proposed multidisciplinary solution targeting ${ch.category} in ${ch.district}.`);
                  setProposalSubmitted(false);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedChallenge?.id === ch.id
                    ? 'bg-slate-800 border-purple-500/80 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-purple-300 font-bold">{ch.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                    {ch.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">{ch.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{ch.district} • {ch.category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Proposal Submission Module */}
        <div className="lg:col-span-8 bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-6">
          {selectedChallenge ? (
            <>
              <div className="pb-4 border-b border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold">Target Challenge: {selectedChallenge.id}</span>
                <h2 className="text-lg font-bold text-white mt-1">{selectedChallenge.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{selectedChallenge.citizen_description}</p>
              </div>

              {proposalSubmitted ? (
                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h3 className="text-base font-bold text-white">Solution Proposal Submitted!</h3>
                  <p className="text-xs text-slate-300">Your proposal has been published to the Industry & CSR Marketplace for funding pledges.</p>
                </div>
              ) : (
                <form onSubmit={handleProposalSubmit} className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-purple-400" /> Create Solution Proposal
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Proposal Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Abstract & Proposed Technology *</label>
                    <textarea
                      required
                      rows={3}
                      value={abstract}
                      onChange={(e) => setAbstract(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Faculty Lead / Mentor</label>
                      <input
                        type="text"
                        value={facultyLead}
                        onChange={(e) => setFacultyLead(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Multidisciplinary Student Members</label>
                      <input
                        type="text"
                        value={students}
                        onChange={(e) => setStudents(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Estimated Budget (INR ₹) *</label>
                      <input
                        type="number"
                        required
                        value={budgetINR}
                        onChange={(e) => setBudgetINR(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Duration (Months)</label>
                      <input
                        type="number"
                        value={durationMonths}
                        onChange={(e) => setDurationMonths(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Submit Proposal for CSR Funding
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select an assigned challenge from the list to view details and submit a proposal.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
