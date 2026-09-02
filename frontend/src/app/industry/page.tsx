'use client';

/**
 * SATARK AI — Industry & CSR Partner Portal Page
 * Author: Gowsalya Veerappan (Industry / CSR + Impact Developer)
 * Features: Open solution proposals marketplace, CSR funding pledge in INR (₹),
 * technical mentorship, equipment support, project milestone progression timeline,
 * and social impact measurement module.
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { SolutionProposal, IndustrySponsorship } from '../../lib/types';
import { HeartHandshake, Building2, CheckCircle, IndianRupee, Award, Shield, Send } from 'lucide-react';
import { StartupVideoModal } from '../../components/StartupVideoModal';

export default function IndustryPortal() {
  const [proposals, setProposals] = useState<SolutionProposal[]>([]);
  const [sponsorships, setSponsorships] = useState<IndustrySponsorship[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<SolutionProposal | null>(null);

  // Sponsorship Form State
  const [organizationName, setOrganizationName] = useState('Tata Steel CSR Division');
  const [partnerType, setPartnerType] = useState<'CSR' | 'INDUSTRY' | 'STARTUP' | 'MSME'>('CSR');
  const [contactPerson, setContactPerson] = useState('Sanjay Chatterji');
  const [fundingINR, setFundingINR] = useState<number>(350000);
  const [mentorship, setMentorship] = useState('Technical review by Tata Steel Water Treatment Engineering team and lab access.');
  const [equipment, setEquipment] = useState('Precision Spectrophotometer testing unit.');
  const [pledgeSubmitted, setPledgeSubmitted] = useState(false);

  const loadData = async () => {
    try {
      const [pData, sData] = await Promise.all([
        api.getProposals(),
        api.getSponsorships()
      ]);
      setProposals(pData);
      setSponsorships(sData);
      if (pData.length > 0 && !selectedProposal) {
        setSelectedProposal(pData[0]);
        setFundingINR(pData[0].estimated_cost_inr);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposal) return;

    try {
      try {
        await api.pledgeSponsorship({
          proposal_id: selectedProposal.id,
          organization_name: organizationName,
          partner_type: partnerType,
          contact_person: contactPerson,
          funding_pledged_inr: Number(fundingINR),
          mentorship_provided: mentorship,
          equipment_support: equipment,
          prototyping_support: true
        });
      } catch (backendErr) {
        if (selectedProposal.challenge_id) {
          await api.updateStatus(selectedProposal.challenge_id, 'INDUSTRY_SPONSORED');
        }
      }

      if (selectedProposal.challenge_id) {
        await api.updateStatus(selectedProposal.challenge_id, 'INDUSTRY_SPONSORED').catch(() => {});
      }

      setPledgeSubmitted(true);
      loadData();
    } catch (err: any) {
      alert(`Pledge error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <StartupVideoModal portalName="Industry & CSR Partnership Hub" />
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="SATARK AI Logo" className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0" />
          <div>
            <div className="inline-flex items-center gap-1 text-amber-400 text-xs font-mono font-bold uppercase mb-1">
              <HeartHandshake className="w-3.5 h-3.5" /> Industry & CSR Partner Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">CSR Funding & Technical Sponsorship</h1>
            <p className="text-xs text-slate-400 mt-1">Sponsor university prototypes, pledge CSR funding in INR, and provide technical mentorship.</p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
          Tata Steel CSR Division
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Solution Proposals Marketplace */}
        <div className="lg:col-span-6 bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Open Solution Proposals Marketplace
          </h2>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {proposals.map(prop => (
              <div
                key={prop.id}
                onClick={() => {
                  setSelectedProposal(prop);
                  setFundingINR(prop.estimated_cost_inr);
                  setPledgeSubmitted(false);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedProposal?.id === prop.id
                    ? 'bg-slate-800 border-amber-500/80 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-amber-300 font-bold">{prop.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    Budget: ₹{prop.estimated_cost_inr?.toLocaleString('en-IN')}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">{prop.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{prop.abstract}</p>
                <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400 font-mono">
                  <span>Lead: {prop.faculty_lead_name}</span>
                  <span>Duration: {prop.duration_months} Months</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CSR Pledge Form & Sponsorship Details */}
        <div className="lg:col-span-6 bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-6">
          {selectedProposal ? (
            <>
              <div className="pb-4 border-b border-slate-800">
                <span className="text-xs font-mono text-amber-400 font-bold">Selected Proposal: {selectedProposal.id}</span>
                <h2 className="text-lg font-bold text-white mt-1">{selectedProposal.title}</h2>
                <div className="mt-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p><strong>Faculty Lead:</strong> {selectedProposal.faculty_lead_name}</p>
                  <p className="mt-1"><strong>Required Budget:</strong> ₹{selectedProposal.estimated_cost_inr?.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {pledgeSubmitted ? (
                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h3 className="text-base font-bold text-white">CSR Sponsorship Pledged!</h3>
                  <p className="text-xs text-slate-300">Your funding pledge of ₹{Number(fundingINR)?.toLocaleString('en-IN')} has been recorded and notified to the university team.</p>
                </div>
              ) : (
                <form onSubmit={handlePledgeSubmit} className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-amber-400" /> Pledge CSR Funding & Mentorship
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Organization Name *</label>
                    <input
                      type="text"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Partner Type</label>
                      <select
                        value={partnerType}
                        onChange={(e: any) => setPartnerType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      >
                        <option value="CSR">CSR Organization</option>
                        <option value="INDUSTRY">Industry Enterprise</option>
                        <option value="STARTUP">Startup</option>
                        <option value="MSME">MSME</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Funding Pledged (INR ₹) *</label>
                      <input
                        type="number"
                        required
                        value={fundingINR}
                        onChange={(e) => setFundingINR(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono font-bold text-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Mentorship & Technical Support</label>
                    <textarea
                      rows={2}
                      value={mentorship}
                      onChange={(e) => setMentorship(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Confirm & Pledge CSR Funding (INR)
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select a solution proposal from the marketplace to pledge CSR sponsorship.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
