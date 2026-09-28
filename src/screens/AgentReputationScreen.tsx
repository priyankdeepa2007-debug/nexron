import React, { useState } from 'react';
import { AssayerInfo, ScreenId } from '../types';

interface AgentReputationScreenProps {
  onNavigate: (screen: ScreenId) => void;
  assayers: AssayerInfo[];
}

interface SimState {
  label: 'MATCH' | 'MINOR' | 'MISMATCH' | 'RESOLVED';
  penalty: number;
  bg: string;
  text: string;
  isConfirmed: boolean;
}

const SIM_STATES: SimState[] = [
  { label: 'MATCH', penalty: 0.0, bg: 'bg-primary-container', text: 'text-on-primary', isConfirmed: true },
  { label: 'MINOR', penalty: 0.25, bg: 'bg-secondary-fixed-dim', text: 'text-on-secondary-fixed', isConfirmed: true },
  { label: 'MISMATCH', penalty: 1.0, bg: 'bg-error', text: 'text-on-error', isConfirmed: false },
  { label: 'RESOLVED', penalty: 0.0, bg: 'bg-surface-container-highest', text: 'text-on-surface', isConfirmed: true },
];

export const AgentReputationScreen: React.FC<AgentReputationScreenProps> = ({
  onNavigate: _onNavigate,
  assayers,
}) => {
  // Baseline slots: Slot 1: MATCH(0), Slot 2: MATCH(0), Slot 3: MINOR(1), Slot 4: MATCH(0), Slot 5: MATCH(0)
  const [slotIndices, setSlotIndices] = useState<number[]>([0, 0, 1, 0, 0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSlotClick = (index: number) => {
    setSlotIndices((prev) => {
      const next = [...prev];
      next[index] = (next[index] + 1) % SIM_STATES.length;
      return next;
    });
  };

  const handleResetBaseline = () => {
    setSlotIndices([0, 0, 1, 0, 0]);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Recency calculation
  const n = slotIndices.length;
  let weightedPenaltySum = 0;
  let totalWeight = 0;
  let confirmedCount = 0;

  slotIndices.forEach((stateIdx, i) => {
    const st = SIM_STATES[stateIdx];
    const weight = Math.pow(0.8, n - 1 - i);
    weightedPenaltySum += weight * st.penalty;
    totalWeight += weight;
    if (st.isConfirmed && st.penalty < 1.0) {
      confirmedCount++;
    }
  });

  const normalizedDefect = weightedPenaltySum / totalWeight;
  let computedScore = 5.0 - 4.0 * normalizedDefect;
  computedScore = Math.max(1.0, Math.min(5.0, computedScore));
  const confirmRate = ((confirmedCount / n) * 100).toFixed(1);
  const scorePercent = ((computedScore - 1.0) / 4.0) * 100;

  let tierPill = 'Tier 1 Master';
  let tierPillBg = 'bg-primary text-on-primary';
  let barColor = 'bg-primary';
  let behaviorMsg =
    'Exceptional reputation. Recency formula confirms consistent grading alignment with zero recent flags.';

  if (computedScore >= 4.5) {
    tierPill = 'Tier 1 Master';
    tierPillBg = 'bg-primary text-on-primary';
    barColor = 'bg-primary';
    behaviorMsg =
      'Exceptional reputation. Recency formula confirms consistent grading alignment with zero recent flags.';
  } else if (computedScore >= 3.8) {
    tierPill = 'Active Compliant';
    tierPillBg = 'bg-primary-container text-on-primary';
    barColor = 'bg-primary-container';
    behaviorMsg =
      'Good standing. Historical minor variances are successfully decaying over time without triggering audit flags.';
  } else {
    tierPill = 'Calibration Warning';
    tierPillBg = 'bg-error-container text-on-error-container';
    barColor = 'bg-error';
    behaviorMsg =
      'Threshold breached! Fresh errors in recent slots heavily decay the reputation score below APMC clearance.';
  }

  const slotLabels = ['4 ago', '3 ago', '2 ago', 'Previous', 'Latest'];
  const slotWeights = ['w=0.41', 'w=0.51', 'w=0.64', 'w=0.80', 'w=1.00'];

  return (
    <div className="flex flex-col w-full">
      <div className="w-full px-gutter-desktop py-space-lg flex flex-col gap-space-lg">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs max-w-3xl">
            <div className="flex items-center gap-space-xs">
              <span className="px-space-xs py-0.5 rounded bg-primary-container text-on-primary font-code-sm text-code-sm uppercase tracking-wider font-semibold">
                Assayer Trust Protocol
              </span>
              <span className="text-outline font-code-sm text-code-sm uppercase tracking-wider">
                • RFC 8785 Canonical Grading Telemetry
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
              Agent Reputation Engine
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Empirical scoring of mandi quality assayers and SHG operators using recency-weighted exponential decay.
              Produces verifiable accountability, shields against systemic bias, and ensures farmer produce is assessed with
              audited consistency.
            </p>
          </div>
          <div className="flex items-center gap-space-sm self-start md:self-auto">
            <button
              className="flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-sm rounded-lg text-primary font-label-lg text-label-lg shadow-sm hover:bg-surface-container transition-colors cursor-pointer"
              type="button"
              onClick={() => showToast('Audit Ledger CSV export generated for Tamil Nadu APMC Directorate.')}
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>Export Audit Ledger</span>
            </button>
            <button
              className="flex items-center gap-space-xs bg-primary text-on-primary px-space-md py-space-sm rounded-lg font-label-lg text-label-lg shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
              type="button"
              onClick={() => showToast('Mandi probe calibration packets dispatched to 3 network nodes.')}
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Calibrate Node Mandis</span>
            </button>
          </div>
        </div>

        {/* Mathematical Decay Formulation & Policy Bounds */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md pb-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">functions</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Mathematical Decay Formulation &amp; Policy Bounds
                </span>
                <span className="font-label-md text-label-md text-outline">
                  Deterministic Assayer Rating Algorithm • APMC / FCI Standard Grade Compliance
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1 rounded-lg font-code-sm text-code-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
              <span>Decay Constant λ = 0.80 • Bound [1.0, 5.0]</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-xs">
            <div className="flex flex-col bg-surface-container-low p-space-md rounded-lg gap-space-xs">
              <span className="font-label-md text-label-md text-outline uppercase tracking-wider">
                Primary Score Formula
              </span>
              <div className="font-code-md text-code-md text-primary font-semibold">
                Score = 5 - 4 × [∑(w<sub>i</sub> × P<sub>i</sub>) / ∑(w<sub>i</sub>)]
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Scales linearly between 1.0 (lowest) and 5.0 (perfect). Unbiased by historical sheer volume.
              </p>
            </div>
            <div className="flex flex-col bg-surface-container-low p-space-md rounded-lg gap-space-xs">
              <span className="font-label-md text-label-md text-outline uppercase tracking-wider">
                Recency Weight Vector
              </span>
              <div className="font-code-md text-code-md text-primary font-semibold">
                w<sub>i</sub> = 0.8<sup>(n - 1 - i)</sup>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Recent lots (i = n-1, w = 1.0) carry up to <strong className="text-on-surface font-semibold">5× weight</strong> of older assessments (k = 8, w ≈ 0.17).
              </p>
            </div>
            <div className="flex flex-col bg-surface-container-low p-space-md rounded-lg gap-space-xs">
              <span className="font-label-md text-label-md text-outline uppercase tracking-wider">
                Penalty Hierarchy (P<sub>i</sub>)
              </span>
              <div className="font-code-sm text-code-sm flex flex-col gap-1 text-on-surface">
                <div className="flex items-center justify-between">
                  <span className="text-primary font-semibold">MATCH (Conform):</span> <span>0.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary font-semibold">MINOR (Variance ≤5%):</span> <span>0.25</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-error font-semibold">MISMATCH (Defect):</span> <span>1.00</span>
                </div>
              </div>
              <span className="font-code-sm text-code-sm text-outline mt-1">*Upheld disputes reset to MATCH 0.00</span>
            </div>
            <div className="flex flex-col bg-surface-container-low p-space-md rounded-lg gap-space-xs">
              <span className="font-label-md text-label-md text-outline uppercase tracking-wider">
                Confirmation Rate
              </span>
              <div className="font-code-md text-code-md text-primary font-semibold">
                CR = [(M + MINOR) / Total] × 100%
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Represents gross acceptance percentage. Does not mask recent clusters of grading divergence.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Assayer Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
          {assayers.map((assayer) => {
            const isLakshmi = assayer.id === 'lakshmi';
            const isSelvi = assayer.id === 'selvi';
            const isMurugan = assayer.id === 'murugan';

            const scoreColor = isMurugan ? 'text-error' : 'text-primary';
            const rateColor = isMurugan ? 'text-error' : 'text-primary';

            return (
              <div
                key={assayer.id}
                className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm p-space-lg justify-between gap-space-md"
              >
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-start justify-between gap-space-sm">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden">
                        <img
                          className="w-full h-full object-cover"
                          src={assayer.avatarUrl}
                          alt={assayer.name}
                        />
                      </div>
                      <div className="flex flex-col">
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{assayer.name}</h2>
                        <span className="font-label-md text-label-md text-outline">
                          {assayer.role} • {assayer.mandi}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-space-xs py-1 rounded font-code-sm text-code-sm font-semibold uppercase ${
                        isLakshmi
                          ? 'bg-primary-fixed text-on-primary-fixed'
                          : isSelvi
                          ? 'bg-secondary-fixed text-on-secondary-fixed'
                          : 'bg-error-container text-on-error-container'
                      }`}
                    >
                      {assayer.tier}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-space-xs">
                    <div className="flex items-baseline gap-space-xs">
                      <span className={`font-headline-xl text-headline-xl font-bold ${scoreColor}`}>
                        {assayer.rating.toFixed(1)}
                      </span>
                      <span className="font-body-md text-body-md text-outline">/ 5.0</span>
                      <div className="flex text-secondary-container ml-1">
                        {Array.from({ length: 5 }).map((_, starIdx) => {
                          const ratingDiff = assayer.rating - starIdx;
                          if (ratingDiff >= 1) {
                            return (
                              <span
                                key={starIdx}
                                className="material-symbols-outlined text-[18px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                star
                              </span>
                            );
                          } else if (ratingDiff >= 0.5) {
                            return (
                              <span
                                key={starIdx}
                                className="material-symbols-outlined text-[18px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                star_half
                              </span>
                            );
                          }
                          return (
                            <span key={starIdx} className="material-symbols-outlined text-[18px]">
                              star
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-code-md text-code-md font-bold ${rateColor}`}>
                        {((assayer.confirmedCount / assayer.totalAssayed) * 100).toFixed(1)}%
                      </span>
                      <span className="font-label-md text-label-md text-outline">
                        {assayer.confirmedCount} of {assayer.totalAssayed} Confirmed
                      </span>
                    </div>
                  </div>

                  {/* Recency sequence chips */}
                  <div className="flex flex-col gap-space-xs bg-surface-container-low p-space-sm rounded-lg">
                    <div className="flex items-center justify-between font-label-md text-label-md text-on-surface-variant">
                      <span>Recency History Sequence (Oldest → Most Recent)</span>
                      <span className="font-code-sm text-code-sm text-outline">
                        {assayer.history.length} {isLakshmi ? 'Samples' : 'Checkpoints'}
                      </span>
                    </div>
                    <div className="flex items-center justify-start gap-1.5 py-1 flex-wrap">
                      {assayer.history.map((status, hIdx) => {
                        const isLatest = hIdx === assayer.history.length - 1;
                        let chipBg = 'bg-primary-container text-on-primary';
                        let label = 'M';
                        let ringClass = '';

                        if (status === 'MINOR') {
                          chipBg = 'bg-secondary-fixed-dim text-on-secondary-fixed';
                          label = 'm';
                        } else if (status === 'MISMATCH') {
                          chipBg = 'bg-error text-on-error';
                          label = 'X';
                        } else if (status === 'RESOLVED') {
                          chipBg = 'bg-error text-on-error line-through';
                          label = 'X';
                        }

                        if (isLatest) {
                          ringClass = isMurugan ? 'ring-2 ring-error-container' : 'ring-2 ring-primary-fixed';
                        }

                        return (
                          <span
                            key={hIdx}
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-code-sm text-code-sm font-bold ${chipBg} ${ringClass}`}
                            title={`${status} (slot #${hIdx + 1})`}
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between font-code-sm text-code-sm text-outline px-0.5">
                      <span>{isSelvi ? 'Resolved Upheld (P=0)' : isMurugan ? 'Early Normal' : 'i = 0 (w=0.13)'}</span>
                      <span className={isMurugan ? 'text-error font-semibold' : 'text-primary font-semibold'}>
                        {isSelvi ? 'Decayed Error Fades' : isMurugan ? 'Consecutive Recent Mismatches' : 'Latest Lot (w=1.00)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-label-md text-label-md text-outline uppercase tracking-wider">
                      Assayer Audit Analysis
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{assayer.analysis}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-space-sm font-code-sm text-code-sm text-outline">
                  <span>
                    Assayed: <strong className="text-on-surface font-semibold">{assayer.assayedMT} MT</strong>
                  </span>
                  {isLakshmi && (
                    <span className="text-primary font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> Node Verified
                    </span>
                  )}
                  {isSelvi && (
                    <span className="text-secondary font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">history</span> Restored Confidence
                    </span>
                  )}
                  {isMurugan && (
                    <span className="text-error font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">warning</span> Audit Hold Active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Recency Simulator */}
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm">
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[22px]">calculate</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Interactive Recency Simulator
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-outline">
                Mutate inspection outcomes across slots to observe how exponential decay (0.8<sup>k</sup>) heavily weights
                immediate performance over past anomalies.
              </p>
            </div>
            <button
              className="px-space-sm py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-code-sm text-code-sm hover:text-on-surface self-start lg:self-auto cursor-pointer"
              id="resetSimBtn"
              onClick={handleResetBaseline}
              type="button"
            >
              Reset to Selvi&apos;s Baseline
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between font-label-md text-label-md text-outline">
                  <span>INSPECTION SEQUENCE (CHRONOLOGICAL)</span>
                  <span>CLICK TO TOGGLE STATUS</span>
                </div>
                <div className="grid grid-cols-5 gap-space-sm" id="slotContainer">
                  {slotIndices.map((stIdx, idx) => {
                    const st = SIM_STATES[stIdx];
                    const isLatest = idx === 4;

                    return (
                      <div
                        key={idx}
                        className={`sim-slot flex flex-col p-space-sm rounded-lg gap-space-xs cursor-pointer transition-all ${
                          isLatest
                            ? 'bg-surface-container-high ring-2 ring-primary'
                            : 'bg-surface-container-low hover:bg-surface-container'
                        }`}
                        onClick={() => handleSlotClick(idx)}
                      >
                        <div className="flex items-center justify-between font-code-sm text-code-sm text-outline">
                          <span>Slot #{idx + 1}</span>
                          <span
                            className={`slot-weight font-semibold ${
                              isLatest ? 'text-primary font-bold' : 'text-on-surface'
                            }`}
                          >
                            {slotWeights[idx]}
                          </span>
                        </div>
                        <div
                          className={`slot-state-badge px-space-xs py-1 rounded text-center font-code-sm text-code-sm font-semibold ${st.bg} ${st.text}`}
                        >
                          {st.label}
                        </div>
                        <span
                          className={`font-label-md text-label-md text-center slot-sub ${
                            isLatest ? 'text-primary font-bold' : 'text-outline'
                          }`}
                        >
                          {slotLabels[idx]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Legend */}
              <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-lg font-code-sm text-code-sm text-on-surface-variant flex-wrap gap-2">
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-primary"></span>
                  <span>MATCH (0.0)</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-secondary-fixed-dim"></span>
                  <span>MINOR (0.25)</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-error"></span>
                  <span>MISMATCH (1.0)</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-surface-container-highest"></span>
                  <span>RESOLVED (0.0)</span>
                </div>
              </div>
            </div>

            {/* Right computation card */}
            <div className="lg:col-span-5 flex flex-col bg-surface-container-low p-space-lg rounded-xl gap-space-md">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-outline uppercase tracking-wider">
                  Computed Reputation Score
                </span>
                <span className="font-code-sm text-code-sm text-primary font-bold" id="simConfirmationRate">
                  {confirmRate}% Confirm Rate
                </span>
              </div>
              <div className="flex items-baseline gap-space-sm">
                <span className="font-headline-xl text-headline-xl text-primary font-bold" id="simComputedScore">
                  {computedScore.toFixed(2)}
                </span>
                <span className="font-body-lg text-body-lg text-outline">/ 5.00</span>
                <span
                  className={`ml-auto px-space-xs py-1 rounded font-code-sm text-code-sm font-semibold uppercase ${tierPillBg}`}
                  id="simStatusPill"
                >
                  {tierPill}
                </span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div
                  className={`${barColor} h-full transition-all duration-300`}
                  id="simScoreBar"
                  style={{ width: `${scorePercent}%` }}
                ></div>
              </div>
              <div className="flex flex-col gap-1 text-on-surface-variant font-code-sm text-code-sm pt-space-xs">
                <div className="flex justify-between">
                  <span>Weighted Penalty Sum [∑(w × P)]:</span>
                  <span className="font-mono font-bold text-on-surface" id="simWeightedPenaltySum">
                    {weightedPenaltySum.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Recency Weight [∑w]:</span>
                  <span className="font-mono font-bold text-on-surface" id="simWeightSum">
                    {totalWeight.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Normalized Weighted Defect:</span>
                  <span className="font-mono font-bold text-secondary" id="simNormalizedDefect">
                    {normalizedDefect.toFixed(4)}
                  </span>
                </div>
              </div>
              <div className="p-space-sm bg-surface-container-lowest rounded-lg font-body-sm text-body-sm text-outline">
                <span className="text-on-surface font-medium" id="simBehaviorMessage">
                  {behaviorMsg}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* APMC Procurement Kiosk Summary */}
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">storefront</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  APMC Procurement Kiosk Summary
                </span>
              </div>
              <span className="font-label-md text-label-md text-outline">
                Cross-mandi performance and cryptographic ledger confirmation benchmarks
              </span>
            </div>
            <div className="flex items-center gap-space-xs font-code-sm text-code-sm text-outline">
              <span>
                Active Mandi Nodes: <strong className="text-on-surface">3 of 3 Online</strong>
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead>
                <tr className="bg-surface-container-low text-outline font-label-md text-label-md uppercase tracking-wider">
                  <th className="py-space-sm px-space-md rounded-l-lg">Mandi Node</th>
                  <th className="py-space-sm px-space-md">Assayer in Charge</th>
                  <th className="py-space-sm px-space-md">Commodities Handled</th>
                  <th className="py-space-sm px-space-md">Active Lots</th>
                  <th className="py-space-sm px-space-md">Audited Confirm Rate</th>
                  <th className="py-space-sm px-space-md">Avg Dispute Turnaround</th>
                  <th className="py-space-sm px-space-md rounded-r-lg">Integrity Status</th>
                </tr>
              </thead>
              <tbody className="divide-none text-on-surface font-code-sm text-code-sm">
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="py-space-md px-space-md font-bold text-primary">TN-APMC-09 (Thanjavur)</td>
                  <td className="py-space-md px-space-md font-sans text-on-surface font-medium">Lakshmi R.</td>
                  <td className="py-space-md px-space-md font-sans text-on-surface-variant">Paddy CR-1009, ADT-37</td>
                  <td className="py-space-md px-space-md">18 Lots (420 MT)</td>
                  <td className="py-space-md px-space-md text-primary font-bold">94.4%</td>
                  <td className="py-space-md px-space-md font-sans text-on-surface-variant">1.4 hrs</td>
                  <td className="py-space-md px-space-md">
                    <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-semibold uppercase text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Canonical Seal
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="py-space-md px-space-md font-bold text-primary">TN-APMC-14 (Nagapattinam)</td>
                  <td className="py-space-md px-space-md font-sans text-on-surface font-medium">Selvi P.</td>
                  <td className="py-space-md px-space-md font-sans text-on-surface-variant">Black Gram, Green Gram</td>
                  <td className="py-space-md px-space-md">14 Lots (285 MT)</td>
                  <td className="py-space-md px-space-md text-primary font-bold">85.7%</td>
                  <td className="py-space-md px-space-md font-sans text-on-surface-variant">2.1 hrs</td>
                  <td className="py-space-md px-space-md">
                    <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-semibold uppercase text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Restored Good
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="py-space-md px-space-md font-bold text-error">TN-APMC-21 (Tiruvarur)</td>
                  <td className="py-space-md px-space-md font-sans text-on-surface font-medium">Murugan K.</td>
                  <td className="py-space-md px-space-md font-sans text-on-surface-variant">Paddy Samba, Tomato C-5</td>
                  <td className="py-space-md px-space-md">9 Lots (160 MT)</td>
                  <td className="py-space-md px-space-md text-error font-bold">66.7%</td>
                  <td className="py-space-md px-space-md font-sans text-on-surface-variant">4.8 hrs</td>
                  <td className="py-space-md px-space-md">
                    <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-semibold uppercase text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Hold / Calibrate
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-5 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">info</span>
          <span className="font-label-lg">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
