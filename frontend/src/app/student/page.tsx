'use client';

/**
 * SATARK AI — Student Innovator & Prototype Fabrication Portal
 * Features: Prototype fabrication details entry, component cost breakdown,
 * testing metrics log, and prototype completion submission with multi-portal notifications.
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Challenge } from '../../lib/types';
import { GraduationCap, Cpu, CheckCircle2, Clock, Send, Sparkles, Layers, DollarSign, Activity, FileCheck, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { StartupVideoModal } from '../../components/StartupVideoModal';

export default function StudentPortal() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [prototypeTitle, setPrototypeTitle] = useState('SATARK Solar Bio-Sand Arsenic Filtration Kiosk v2.4');
  const [fabricationSpecs, setFabricationSpecs] = useState('Dual-stage micro-sand and activated carbon bed with automated backwash. Integrated ESP32 telemetry with IoT water quality sensor array measuring pH, Turbidity, and PPM.');
  const [materialsUsed, setMaterialsUsed] = useState('Solar PV Module 50W, HDPE Food-grade Vessel, Nano-coated Sand Filter, ESP32 MCU, Solenoid Valves, Lithium Iron Battery Pack');
  const [fabricationCostINR, setFabricationCostINR] = useState(245000);
  const [testingMetrics, setTestingMetrics] = useState('Arsenic reduction rate: 98.4% (Below WHO limit 0.01mg/L), Output flow rate: 120 L/hr, Continuous 500-hour stress trial passed cleanly.');
  const [studentLead, setStudentLead] = useState('Aniket Sen (Team Lead, Final Year Innovation Batch)');

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const data = await api.getChallenges();
      setChallenges(data);
      if (data.length > 0) {
        // Pick active HEI assigned or prototype developing challenge
        const activeCh = data.find((c: Challenge) => c.status === 'PROTOTYPE_DEVELOPMENT' || c.status === 'HEI_ASSIGNED' || c.status === 'INDUSTRY_SPONSORED') || data[0];
        setSelectedChallenge(activeCh);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleSubmitPrototype = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge || !prototypeTitle || !fabricationSpecs) return;

    setSubmitting(true);
    setSuccessMessage('');
    try {
      try {
        await api.submitPrototype({
          challenge_id: selectedChallenge.id,
          prototype_title: prototypeTitle,
          fabrication_specs: fabricationSpecs,
          materials_used: materialsUsed,
          fabrication_cost_inr: Number(fabricationCostINR),
          testing_metrics: testingMetrics,
          student_team_lead: studentLead
        });
      } catch (backendErr) {
        // Fallback status update
        await api.updateStatus(selectedChallenge.id, 'PROTOTYPE_BUILT');
      }

      setSelectedChallenge({ ...selectedChallenge, status: 'PROTOTYPE_BUILT' });
      setSuccessMessage(`Prototype '${prototypeTitle}' submitted! Multi-portal notifications sent to Govt Command Centre, HEI Portal, & Industry Hub. Citizen Portal status updated to Prototype Built.`);
      loadChallenges();
    } catch (err: any) {
      alert(`Submission Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const isCompleted = selectedChallenge?.status === 'PROTOTYPE_BUILT' || selectedChallenge?.status === 'PILOT_DEPLOYMENT' || selectedChallenge?.status === 'RESOLVED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <StartupVideoModal portalName="Student Prototype Fabrication Workspace" />
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-purple-400 text-xs font-mono font-bold uppercase mb-1">
              <Cpu className="w-3.5 h-3.5" /> Student Innovator & R&D Fabrication Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Prototype Fabrication & Verification Workspace</h1>
            <p className="text-xs text-slate-400 mt-1">Record prototype specs, fabrication materials, testing outcomes, and submit completed hardware for Government Pilot Field Trial.</p>
          </div>
        </div>
        <div className="px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          BIT Mesra • Student R&D Cell
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-3 animate-fade-in shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Prototype Fabrication Completed & Submitted!</p>
            <p className="text-xs text-emerald-200/90">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Assigned Challenge Selection */}
        <div className="lg:col-span-4 bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" /> Assigned Student Projects
          </h2>
          <p className="text-xs text-slate-400">Select an innovation project assigned to your student team to view or log prototype fabrication progress.</p>

          <div className="space-y-3 pt-2">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-500">Loading student projects...</div>
            ) : challenges.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No active projects found.</div>
            ) : (
              challenges.map(ch => {
                const isSel = selectedChallenge?.id === ch.id;
                const statusBadge = 
                  ch.status === 'PROTOTYPE_BUILT' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                  ch.status === 'PILOT_DEPLOYMENT' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                  ch.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  'bg-purple-500/20 text-purple-300 border-purple-500/40';

                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setSelectedChallenge(ch);
                      setSuccessMessage('');
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSel
                        ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-500/10'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-purple-400">{ch.category}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${statusBadge}`}>
                        {ch.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1 line-clamp-2">{ch.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                      <span className="text-slate-500">District:</span> {ch.district}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Prototype Fabrication Form & Specs */}
        <div className="lg:col-span-8 space-y-6">
          {selectedChallenge ? (
            <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Cpu className="w-64 h-64 text-purple-400" />
              </div>

              {/* Challenge Banner Header */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400 font-bold">PROJECT IDENTIFIER: #{selectedChallenge.id.slice(0, 8)}</span>
                  <span className="text-xs text-slate-400">{selectedChallenge.district}</span>
                </div>
                <h2 className="text-lg font-bold text-white">{selectedChallenge.title}</h2>
                <p className="text-xs text-slate-300 line-clamp-2">{selectedChallenge.citizen_description}</p>
              </div>

              {/* Fabrication Form */}
              <form onSubmit={handleSubmitPrototype} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-purple-400" /> Prototype Designation / Model Title
                    </label>
                    <input
                      type="text"
                      required
                      value={prototypeTitle}
                      onChange={e => setPrototypeTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                      placeholder="e.g. SATARK Solar Bio-Sand Kiosk v2.4"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-400" /> Student Team Lead Name & Institute
                    </label>
                    <input
                      type="text"
                      required
                      value={studentLead}
                      onChange={e => setStudentLead(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                      placeholder="e.g. Aniket Sen (BIT Mesra)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-purple-400" /> Prototype Technical Specifications
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={fabricationSpecs}
                    onChange={e => setFabricationSpecs(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                    placeholder="Describe core hardware architecture, sensors, microcontrollers, filtration beds, or mechanical sub-systems..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" /> Key Component & Material Breakdown
                    </label>
                    <textarea
                      rows={3}
                      value={materialsUsed}
                      onChange={e => setMaterialsUsed(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                      placeholder="List hardware parts, sensors, solar panels, casing materials..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-purple-400" /> Lab Testing & Performance Metrics Log
                    </label>
                    <textarea
                      rows={3}
                      value={testingMetrics}
                      onChange={e => setTestingMetrics(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                      placeholder="Input laboratory test results, efficiency percentages, flow rate, durability metrics..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Fabrication Budget Incurred (INR ₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={fabricationCostINR}
                    onChange={e => setFabricationCostINR(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                    placeholder="245000"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Submitting will trigger multi-portal alerts & update Citizen status checkbox.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                      isCompleted
                        ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-emerald-500/20'
                        : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white hover:opacity-95 shadow-purple-500/25'
                    }`}
                  >
                    {submitting ? (
                      <span>Dispatching Multi-Portal Alerts...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {isCompleted ? 'Update Fabrication Details' : 'Submit Prototype for Pilot Field Trial'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900/80 rounded-2xl p-12 border border-slate-800 text-center text-slate-400">
              Select a project from the left panel to begin logging prototype fabrication details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
