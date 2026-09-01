'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface TimelineProps {
  currentStatus: string;
}

const STAGES = [
  { id: 'REPORTED', label: 'Reported by Citizen' },
  { id: 'AI_ANALYZED', label: 'AI Classified & Prioritized' },
  { id: 'GOVERNMENT_VALIDATED', label: 'Govt Admin Validated' },
  { id: 'HEI_ASSIGNED', label: 'University Matched & Assigned' },
  { id: 'PROPOSAL_SUBMITTED', label: 'Solution Proposal Submitted' },
  { id: 'INDUSTRY_SPONSORED', label: 'CSR / Industry Sponsored' },
  { id: 'PROTOTYPE_DEVELOPMENT', label: 'Prototype Fabrication' },
  { id: 'PILOT_DEPLOYMENT', label: 'Pilot Field Trial' },
  { id: 'RESOLVED', label: 'Deployed & Resolved' }
];

export const Timeline: React.FC<TimelineProps> = ({ currentStatus }) => {
  const getStageIndex = (status: string) => {
    const map: Record<string, number> = {
      REPORTED: 0,
      AI_ANALYZED: 1,
      GOVERNMENT_VALIDATED: 2,
      ROUTED: 2,
      ASSIGNED: 2,
      HEI_ASSIGNED: 3,
      TEAM_FORMED: 3,
      PROPOSAL_SUBMITTED: 4,
      PROPOSAL_APPROVED: 4,
      INDUSTRY_SPONSORED: 5,
      PROTOTYPE_DEVELOPMENT: 6,
      PROTOTYPE_BUILT: 6,
      PILOT_DEPLOYMENT: 7,
      IMPACT_VALIDATED: 7,
      PATENTED_RESOLVED: 8,
      RESOLVED: 8
    };
    return map[status] ?? 0;
  };

  const currentIndex = getStageIndex(currentStatus);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between overflow-x-auto pb-4 scrollbar-thin">
        {STAGES.map((stage, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={stage.id} className="flex items-center flex-1 min-w-[120px]">
              <div className="flex flex-col items-center text-center group">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isPassed
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                      : isCurrent
                      ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/30 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <span
                  className={`mt-2 text-[11px] font-medium leading-tight max-w-[100px] ${
                    isCurrent ? 'text-cyan-400 font-bold' : isPassed ? 'text-emerald-300' : 'text-slate-500'
                  }`}
                >
                  {stage.label}
                </span>
              </div>

              {idx < STAGES.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded-full transition-all ${
                    idx < currentIndex ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
