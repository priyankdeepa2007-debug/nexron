import React, { useState } from 'react';
import { ScreenId } from '../types';

interface BuyerRecheckScreenProps {
  onNavigate: (screen: ScreenId) => void;
  openDisputes: number;
  onResolveDispute: (type: 'upheld' | 'buyer') => void;
}

export const BuyerRecheckScreen: React.FC<BuyerRecheckScreenProps> = ({
  onNavigate: _onNavigate,
  openDisputes,
  onResolveDispute,
}) => {
  const [selectedLotId, setSelectedLotId] = useState('LOT-TN-2026-0891');
  const [searchQuery, setSearchQuery] = useState('LOT-TN-2026');

  // Buyer scores
  const [buyerScores, setBuyerScores] = useState({
    size: 0,
    colour: 1,
    moisture: 1,
    defects: 0,
  });

  const [certified, setCertified] = useState(true);
  const [isArbitrating, setIsArbitrating] = useState(false);
  const [hasArbitrated, setHasArbitrated] = useState(true);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [disputeResolved, setDisputeResolved] = useState<string | null>(null);

  const handleLotSelect = (lotId: string) => {
    setSelectedLotId(lotId);
    if (lotId === 'LOT-TN-2026-0888') {
      const el = document.getElementById('tribunal-desk');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRunArbitration = () => {
    if (!certified) {
      alert('Certification required under APMC Bylaw Section 14.');
      return;
    }
    setIsArbitrating(true);
    setTimeout(() => {
      setIsArbitrating(false);
      setHasArbitrated(true);
      const el = document.getElementById('arbitration-results-panel');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  };

  const handleDisputeAction = (type: 'upheld' | 'buyer') => {
    onResolveDispute(type);
    setDisputeResolved(type);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Dynamic Sub-Nav / Breadcrumb Bar */}
      <section className="w-full px-gutter-desktop py-space-sm bg-surface-container-low flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-ping"></span>
          <span className="font-code-sm text-code-sm uppercase tracking-wider text-outline font-semibold">
            ARBITRATION ENGINE:
          </span>
          <span className="font-code-sm text-code-sm text-on-surface bg-surface-container px-space-xs py-0.5 rounded font-bold">
            RFC-8785 STRICT SERVER-SIDE COMPARISON
          </span>
          <span className="font-label-md text-label-md text-outline">• Blind Protocol Enforced</span>
        </div>
        <div className="flex items-center gap-space-md font-code-sm text-code-sm">
          <span className="text-outline">
            Terminal Session: <strong className="text-on-surface">BUYER-MANDI-TN04</strong>
          </span>
          <span className="text-outline">•</span>
          <span className="text-outline">
            Active Assayer: <strong className="text-primary font-semibold">Kaveri Rice Mills Ltd.</strong>
          </span>
        </div>
      </section>

      {/* Main Grid Workspace */}
      <div className="w-full px-gutter-desktop py-space-lg grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
        {/* Left Panel: Locked Lots Queue (col-span-4) */}
        <section className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-md text-label-md text-outline uppercase tracking-wider">
                  Lot Intake Registry
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Mandi Queue &amp; Locks</h2>
              </div>
              <span className="px-space-xs py-1 rounded bg-surface-container font-code-sm text-code-sm text-on-surface-variant font-bold">
                3 Queued
              </span>
            </div>

            {/* Filter / Quick Search */}
            <div className="relative w-full">
              <input
                className="w-full h-11 pl-10 pr-space-sm bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all"
                placeholder="Search Lot ID, Farmer, Mandi..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[20px]">search</span>
            </div>

            {/* Lots Stack */}
            <div className="flex flex-col gap-space-sm mt-1" id="lot-selector-group">
              {/* LOT 1: Selected */}
              <div
                className={`lot-card cursor-pointer p-space-md rounded-xl transition-all relative flex flex-col gap-space-xs ${
                  selectedLotId === 'LOT-TN-2026-0891'
                    ? 'bg-surface-container-low shadow-[0_2px_0_0_#1e5631]'
                    : 'bg-surface-container-lowest hover:bg-surface-container-low'
                }`}
                onClick={() => handleLotSelect('LOT-TN-2026-0891')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-code-sm text-code-sm font-bold text-primary tracking-tight">
                    LOT-TN-2026-0891
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-code-sm text-code-sm font-semibold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    Pending Buyer Re-check
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <p className="font-label-lg text-label-lg text-on-surface font-bold">Paddy (Ponni Raw)</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Farmer: K. Raman • Thanjavur</p>
                  </div>
                  <div className="text-right">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold">3,200</span>
                    <span className="font-code-sm text-code-sm text-outline ml-1">kg</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 bg-surface-container-lowest/70 -mx-space-md -mb-space-md p-space-sm rounded-b-xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-code-sm text-code-sm text-outline">Locked Overall Grade:</span>
                    <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-headline-sm text-headline-sm font-extrabold leading-none">
                      Grade A
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-primary font-semibold flex items-center gap-0.5">
                    Selected
                    <span className="material-symbols-outlined text-[16px]">arrow_right_alt</span>
                  </span>
                </div>
              </div>

              {/* LOT 2: Dispute Status */}
              <div
                className={`lot-card cursor-pointer p-space-md rounded-xl transition-all relative flex flex-col gap-space-xs ${
                  selectedLotId === 'LOT-TN-2026-0888'
                    ? 'bg-surface-container-low shadow-[0_2px_0_0_#ba1a1a]'
                    : 'bg-surface-container-lowest hover:bg-surface-container-low'
                }`}
                onClick={() => handleLotSelect('LOT-TN-2026-0888')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-code-sm text-code-sm font-bold text-on-surface tracking-tight">
                    LOT-TN-2026-0888
                  </span>
                  <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-code-sm text-code-sm font-semibold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                    {disputeResolved ? 'RESOLVED' : 'MISMATCH - In Dispute'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <p className="font-label-lg text-label-lg text-on-surface font-bold">Tomato (Hybrid Shivam)</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Farmer: M. Sundaram • Tiruvarur</p>
                  </div>
                  <div className="text-right">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold">1,500</span>
                    <span className="font-code-sm text-code-sm text-outline ml-1">kg</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 bg-surface-container-high/40 -mx-space-md -mb-space-md p-space-sm rounded-b-xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-code-sm text-code-sm text-outline">Locked Overall:</span>
                    <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-code-sm text-code-sm font-bold">
                      Grade B
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-error font-semibold flex items-center gap-0.5">
                    Spot Audit Required
                    <span className="material-symbols-outlined text-[16px]">gavel</span>
                  </span>
                </div>
              </div>

              {/* LOT 3: Match Verified */}
              <div
                className={`lot-card cursor-pointer p-space-md rounded-xl transition-all relative flex flex-col gap-space-xs ${
                  selectedLotId === 'LOT-TN-2026-0885'
                    ? 'bg-surface-container-low shadow-[0_2px_0_0_#1e5631]'
                    : 'bg-surface-container-lowest hover:bg-surface-container-low'
                }`}
                onClick={() => handleLotSelect('LOT-TN-2026-0885')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-code-sm text-code-sm font-bold text-on-surface tracking-tight">
                    LOT-TN-2026-0885
                  </span>
                  <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-code-sm text-code-sm font-semibold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    MATCH - Verified
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <p className="font-label-lg text-label-lg text-on-surface font-bold">Paddy (CR 1009 Sub 1)</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Farmer: V. Arumugam • Nagapattinam
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold">4,100</span>
                    <span className="font-code-sm text-code-sm text-outline ml-1">kg</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 bg-surface-container-high/40 -mx-space-md -mb-space-md p-space-sm rounded-b-xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-code-sm text-code-sm text-outline">Locked Overall:</span>
                    <span className="px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-code-sm text-code-sm font-bold">
                      Grade A
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-primary font-semibold flex items-center gap-0.5">
                    Sealed #B12
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Chain Integrity Note */}
            <div className="p-space-sm bg-surface-container rounded-lg flex items-start gap-space-sm mt-2">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">security</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                All locked lots are bound to immutable pre-image SHA-256 blocks. Individual sub-criteria are encrypted under
                RFC 8785 blinded commitment.
              </p>
            </div>
          </div>
        </section>

        {/* Middle / Right: Form & Live Simulation Split (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Form Card: Independent Buyer Re-check */}
          <section className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col gap-space-lg relative overflow-hidden">
            {/* Header & Blind Protocol Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-sm bg-surface-container-lowest">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-surface-container font-code-sm text-code-sm font-bold text-on-surface">
                    STEP 2 OF 2
                  </span>
                  <span className="font-label-md text-label-md text-outline uppercase tracking-wider">
                    Independent Quality Assay
                  </span>
                </div>
                <h1 className="font-headline-md text-headline-md text-on-surface mt-1 font-bold">
                  Buyer Re-check Evaluation
                </h1>
              </div>
              <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-2 rounded-lg">
                <span className="material-symbols-outlined text-primary text-[22px]">storefront</span>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-outline">Procuring Buyer</span>
                  <span className="font-label-lg text-label-lg text-on-surface font-bold">Kaveri Rice Mills Ltd.</span>
                </div>
              </div>
            </div>

            {/* Blind Protocol Caution Callout */}
            <div className="bg-tertiary text-on-tertiary p-space-md rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-space-md shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary-container text-[24px]">visibility_off</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-headline-sm font-bold text-surface">
                    Blind Re-check Protocol Enforced
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-code-sm text-code-sm font-bold">
                    STRICT
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-tertiary-container mt-0.5">
                  You are evaluating this lot independently. You can see the agent's overall verdict (
                  <strong className="text-surface font-semibold">Grade A</strong>), but the underlying attribute scores
                  remain encrypted until your scores are submitted to the arbitration node.
                </p>
              </div>
            </div>

            {/* Buyer Profile Info Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm p-space-sm bg-surface-container-low rounded-lg font-code-sm text-code-sm">
              <div className="flex flex-col">
                <span className="text-outline">Assayer License</span>
                <span className="font-semibold text-on-surface">TN-APMC-BUY-4921</span>
              </div>
              <div className="flex flex-col">
                <span className="text-outline">Representative</span>
                <span className="font-semibold text-on-surface">R. Krishnan (Lead Assayer)</span>
              </div>
              <div className="flex flex-col">
                <span className="text-outline">Moisture Meter Ref</span>
                <span className="font-semibold text-on-surface">DICKEY-john GAC2500 #08</span>
              </div>
            </div>

            {/* 4-Attribute Scoring Matrix Grid */}
            <div className="flex flex-col gap-space-md mt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                  Attribute Scoring (0 = Premium/Nil • 3 = Severe Defect)
                </h3>
                <span className="font-code-sm text-code-sm text-outline">FCI FAQ Indian Grain Spec</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {/* Attribute 1: Size & Uniformity */}
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">straighten</span>
                      <span className="font-label-lg text-label-lg text-on-surface font-bold">
                        1. Grain Size &amp; Uniformity
                      </span>
                    </div>
                    <span className="font-code-sm text-code-sm text-outline">Calibrated Sieve</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Ratio of sound mature whole grains to undersized broken kernels.
                  </p>
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {[
                      { val: 0, label: '> 95% Uniform' },
                      { val: 1, label: '85-94% Uniform' },
                      { val: 2, label: '70-84% Uniform' },
                      { val: 3, label: '< 70% Irregular' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        className={`score-btn flex flex-col items-center py-2.5 px-1 rounded-lg font-bold transition-all cursor-pointer ${
                          buyerScores.size === opt.val
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                        }`}
                        onClick={() => setBuyerScores((s) => ({ ...s, size: opt.val }))}
                        type="button"
                      >
                        <span className="font-headline-sm text-headline-sm">{opt.val}</span>
                        <span className="font-code-sm text-code-sm uppercase text-[11px] text-center">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attribute 2: Colour & Lustre */}
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">palette</span>
                      <span className="font-label-lg text-label-lg text-on-surface font-bold">
                        2. Colour &amp; Lustre
                      </span>
                    </div>
                    <span className="font-code-sm text-code-sm text-outline">Photometric Spec</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Visual appearance, natural grain sheen, absence of weather-bleaching.
                  </p>
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {[
                      { val: 0, label: 'Bright Luster' },
                      { val: 1, label: 'Normal Hue' },
                      { val: 2, label: 'Dull / Faded' },
                      { val: 3, label: 'Discolored' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        className={`score-btn flex flex-col items-center py-2.5 px-1 rounded-lg font-bold transition-all cursor-pointer ${
                          buyerScores.colour === opt.val
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                        }`}
                        onClick={() => setBuyerScores((s) => ({ ...s, colour: opt.val }))}
                        type="button"
                      >
                        <span className="font-headline-sm text-headline-sm">{opt.val}</span>
                        <span className="font-code-sm text-code-sm uppercase text-[11px] text-center">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attribute 3: Moisture Content */}
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">water_drop</span>
                      <span className="font-label-lg text-label-lg text-on-surface font-bold">
                        3. Moisture Content
                      </span>
                    </div>
                    <span className="font-code-sm text-code-sm text-outline">Mandi Meter 13.8%</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Calibrated electronic probe moisture percentage. Crucial for storage life.
                  </p>
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {[
                      { val: 0, label: '< 12.0%' },
                      { val: 1, label: '12.1-14.0%' },
                      { val: 2, label: '14.1-16.0%' },
                      { val: 3, label: '> 16.0% Damp' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        className={`score-btn flex flex-col items-center py-2.5 px-1 rounded-lg font-bold transition-all cursor-pointer ${
                          buyerScores.moisture === opt.val
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                        }`}
                        onClick={() => setBuyerScores((s) => ({ ...s, moisture: opt.val }))}
                        type="button"
                      >
                        <span className="font-headline-sm text-headline-sm">{opt.val}</span>
                        <span className="font-code-sm text-code-sm uppercase text-[11px] text-center">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attribute 4: Foreign Matter & Defects */}
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">pest_control</span>
                      <span className="font-label-lg text-label-lg text-on-surface font-bold">
                        4. Foreign Matter &amp; Damage
                      </span>
                    </div>
                    <span className="font-code-sm text-code-sm text-outline">Chaff / Inorganics</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Percentage of weed seeds, stones, weeviled or insect-bored grains.
                  </p>
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {[
                      { val: 0, label: 'Nil (<0.5%)' },
                      { val: 1, label: '0.6-1.5%' },
                      { val: 2, label: '1.6-3.0%' },
                      { val: 3, label: '> 3.0% Reject' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        className={`score-btn flex flex-col items-center py-2.5 px-1 rounded-lg font-bold transition-all cursor-pointer ${
                          buyerScores.defects === opt.val
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                        }`}
                        onClick={() => setBuyerScores((s) => ({ ...s, defects: opt.val }))}
                        type="button"
                      >
                        <span className="font-headline-sm text-headline-sm">{opt.val}</span>
                        <span className="font-code-sm text-code-sm uppercase text-[11px] text-center">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action CTA & Signature Lock */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-md border-t-0 bg-surface-container-low p-space-md rounded-xl">
              <div className="flex items-center gap-space-sm">
                <input
                  checked={certified}
                  onChange={(e) => setCertified(e.target.checked)}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                  id="assayer-declaration"
                  type="checkbox"
                />
                <label className="font-body-sm text-body-sm text-on-surface cursor-pointer select-none" htmlFor="assayer-declaration">
                  I certify under APMC Bylaw Section 14 that this evaluation was drawn from random lot spears.
                </label>
              </div>
              <button
                className="w-full sm:w-auto px-space-xl py-3.5 bg-primary text-on-primary font-headline-sm text-headline-sm font-bold rounded-xl shadow-md hover:bg-primary-container active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                onClick={handleRunArbitration}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isArbitrating ? 'hourglass_top' : 'lock_clock'}
                </span>
                <span>
                  {isArbitrating ? 'Running Arbitration...' : 'Submit Re-check & Run Server Arbitration'}
                </span>
              </button>
            </div>
          </section>

          {/* Server Arbitration Result Card (Simulated Active for LOT-0891) */}
          {hasArbitrated && (
            <section
              className="bg-surface-container-lowest p-space-xl rounded-xl shadow-md flex flex-col gap-space-lg relative border-l-4 border-l-secondary-container"
              id="arbitration-results-panel"
            >
              {/* Header with Status Badge */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
                    <span className="font-code-sm text-code-sm text-outline uppercase font-semibold">
                      ARBITRATION ENGINE RESOLUTION • LOT-TN-2026-0891
                    </span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface mt-0.5 font-bold">
                    Automated Multi-Party Diff Matrix
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded bg-secondary-fixed text-on-secondary-fixed font-code-sm text-code-sm font-bold flex items-center gap-1.5 shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>MINOR DIFFERENCE (AUTO-RESOLVED)</span>
                  </span>
                </div>
              </div>

              {/* Rule Verdict Notification Banner */}
              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    Δ1
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">
                      Server Arbitration Rule Evaluation
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Max attribute variance = <strong className="text-on-surface">1 level</strong> across exactly 1
                      dimension (Moisture). Rule{' '}
                      <code className="font-code-sm text-code-sm text-primary font-bold">APMC-RULE-03B</code> triggered:
                      Minor tolerance permitted. <strong>Locked Grade A stands as canonical.</strong>
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded bg-surface-container text-on-surface-variant font-code-sm text-code-sm shrink-0">
                  Hash Diff: 0x8a92...e411
                </div>
              </div>

              {/* Diff Matrix Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left font-body-sm text-body-sm">
                  <thead>
                    <tr className="bg-surface-container font-code-sm text-code-sm text-outline uppercase">
                      <th className="py-space-sm px-space-md rounded-l-lg">Attribute Name</th>
                      <th className="py-space-sm px-space-md text-center">Agent Locked Score</th>
                      <th className="py-space-sm px-space-md text-center">Buyer Submitted Score</th>
                      <th className="py-space-sm px-space-md text-center">Variance (Diff)</th>
                      <th className="py-space-sm px-space-md text-right rounded-r-lg">Arbitration Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-transparent">
                    <tr className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-space-md px-space-md font-label-lg text-label-lg font-semibold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-outline text-[18px]">straighten</span>
                        <span>Grain Size &amp; Uniformity</span>
                      </td>
                      <td className="py-space-md px-space-md text-center font-code-md text-code-md font-bold text-on-surface">
                        0
                      </td>
                      <td className="py-space-md px-space-md text-center font-code-md text-code-md font-bold text-on-surface">
                        {buyerScores.size}
                      </td>
                      <td className="py-space-md px-space-md text-center">
                        <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-bold">
                          {Math.abs(0 - buyerScores.size)}
                        </span>
                      </td>
                      <td className="py-space-md px-space-md text-right">
                        <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-code-sm text-code-sm font-semibold uppercase">
                          {buyerScores.size === 0 ? 'Exact Match' : 'Tolerance Evaluated'}
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-space-md px-space-md font-label-lg text-label-lg font-semibold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-outline text-[18px]">palette</span>
                        <span>Colour &amp; Lustre</span>
                      </td>
                      <td className="py-space-md px-space-md text-center font-code-md text-code-md font-bold text-on-surface">
                        1
                      </td>
                      <td className="py-space-md px-space-md text-center font-code-md text-code-md font-bold text-on-surface">
                        {buyerScores.colour}
                      </td>
                      <td className="py-space-md px-space-md text-center">
                        <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-bold">
                          {Math.abs(1 - buyerScores.colour)}
                        </span>
                      </td>
                      <td className="py-space-md px-space-md text-right">
                        <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-code-sm text-code-sm font-semibold uppercase">
                          {buyerScores.colour === 1 ? 'Exact Match' : 'Minor Tolerance'}
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-secondary-fixed/20 hover:bg-secondary-fixed/30 transition-colors rounded-lg">
                      <td className="py-space-md px-space-md font-label-lg text-label-lg font-semibold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-[18px]">water_drop</span>
                        <span className="text-secondary font-bold">Moisture Content</span>
                      </td>
                      <td className="py-space-md px-space-md text-center font-code-md text-code-md font-bold text-on-surface">
                        0 (&lt;12%)
                      </td>
                      <td className="py-space-md px-space-md text-center font-code-md text-code-md font-bold text-secondary">
                        {buyerScores.moisture} (13.8%)
                      </td>
                      <td className="py-space-md px-space-md text-center">
                        <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-extrabold">
                          +{Math.abs(0 - buyerScores.moisture)}
                        </span>
                      </td>
                      <td className="py-space-md px-space-md text-right">
                        <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-code-sm text-code-sm font-semibold uppercase">
                          Minor Tolerance
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-space-md px-space-md font-label-lg text-label-lg font-semibold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-outline text-[18px]">pest_control</span>
                        <span>Foreign Matter &amp; Defects</span>
                      </td>
                      <td className="py-space-md px-space-md text-center font-code-md text-code-md font-bold text-on-surface">
                        0
                      </td>
                      <td className="py-space-md px-space-md text-center font-code-md text-code-md font-bold text-on-surface">
                        {buyerScores.defects}
                      </td>
                      <td className="py-space-md px-space-md text-center">
                        <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-bold">
                          {Math.abs(0 - buyerScores.defects)}
                        </span>
                      </td>
                      <td className="py-space-md px-space-md text-right">
                        <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-code-sm text-code-sm font-semibold uppercase">
                          {buyerScores.defects === 0 ? 'Exact Match' : 'Tolerance Evaluated'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Hash Block Sealed Preview */}
              <div className="p-space-md rounded-xl bg-tertiary text-on-tertiary flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md font-code-sm text-code-sm">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-fixed"></span>
                    <span className="font-bold text-surface">ARBITRATION_RECEIPT_EMITTED</span>
                  </div>
                  <span className="text-tertiary-fixed-dim font-mono text-code-sm">
                    BLOCK_HASH: 0x9f18a20d...772c5b91a • TS: 2026-03-30T10:48:19Z
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-space-md py-2 rounded bg-surface-container-lowest text-primary font-bold hover:bg-surface-container-high transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    type="button"
                    onClick={() => setShowSlipModal(true)}
                  >
                    <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                    <span>Generate Procurement e-Slip</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Section 3: Open Disputes & Spot Audit Desk */}
          <section
            className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col gap-space-lg border-l-4 border-l-error"
            id="tribunal-desk"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[22px]">gavel</span>
                  <span className="font-code-sm text-code-sm text-error uppercase font-bold">
                    APMC MANDI ARBITRATION TRIBUNAL
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface mt-0.5 font-bold">
                  Open Disputes &amp; Official Spot Audit Desk
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-error-container text-on-error-container font-code-sm text-code-sm font-extrabold uppercase">
                  {openDisputes} Active Hold
                </span>
              </div>
            </div>

            {/* Flagged Lot Dispute Card: LOT-TN-2026-0888 */}
            <div className="p-space-lg rounded-xl bg-surface-container-low flex flex-col gap-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-error-container text-error flex items-center justify-center font-bold">
                    !
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-code-md text-code-md font-bold text-on-surface">LOT-TN-2026-0888</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-code-sm text-code-sm">
                        Tomato (Hybrid Shivam)
                      </span>
                      <span className="font-code-sm text-code-sm text-outline">1,500 kg</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Farmer: M. Sundaram (Tiruvarur) • Agent: S. Anbarasan • Buyer: FreshBasket Logistics
                    </p>
                  </div>
                </div>
                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-1">
                  <span className="font-code-sm text-code-sm text-error font-bold uppercase tracking-wider">
                    {disputeResolved ? 'RESOLVED ON CHAIN' : 'CRITICAL VARIANCE'}
                  </span>
                  <span className="font-code-sm text-code-sm text-outline">Diff Score = +5 pts</span>
                </div>
              </div>

              {/* Dispute Breakdown Comparison Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm pt-space-xs font-code-sm text-code-sm">
                <div className="p-space-sm bg-surface-container-lowest rounded-lg">
                  <span className="text-outline">Agent Assayed Grade</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-headline-sm text-headline-sm font-extrabold text-on-surface">Grade B</span>
                    <span className="text-outline">Score sum: 3</span>
                  </div>
                </div>
                <div className="p-space-sm bg-surface-container-lowest rounded-lg">
                  <span className="text-outline">Buyer Assayed Grade</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-headline-sm text-headline-sm font-extrabold text-error">Grade C</span>
                    <span className="text-error font-bold">Score sum: 8</span>
                  </div>
                </div>
                <div className="p-space-sm bg-surface-container-lowest rounded-lg">
                  <span className="text-outline">Moisture Variance</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-headline-sm text-headline-sm font-extrabold text-error">Δ 2</span>
                    <span className="text-error">Agent 0 vs Buyer 2</span>
                  </div>
                </div>
                <div className="p-space-sm bg-surface-container-lowest rounded-lg">
                  <span className="text-outline">Defect / Bruise Variance</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-headline-sm text-headline-sm font-extrabold text-error">Δ 3</span>
                    <span className="text-error">Agent 0 vs Buyer 3</span>
                  </div>
                </div>
              </div>

              {/* Spot Audit Ruling Actions */}
              <div className="p-space-md rounded-xl bg-surface-container-lowest flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">
                      Official APMC Assayer Ruling &amp; Cryptographic Ledger Append
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-outline">Mandatory Dual Key Authentication</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Resolving this dispute requires an on-site physical sample draw by the APMC Chief Inspector. Choosing{' '}
                  <strong>Agent Upheld</strong> cancels the temporary agent reputation penalty and updates the dispute
                  state to{' '}
                  <code className="font-code-sm text-code-sm text-primary font-bold">DISPUTE_RESOLVED_UPHELD</code>.
                  Correcting to Buyer penalizes the agent ledger score by 15 trust units.
                </p>

                {disputeResolved ? (
                  <div className="p-space-sm bg-primary-fixed text-on-primary-fixed rounded-lg font-code-sm text-code-sm font-bold flex items-center gap-2 mt-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>
                      Dispute for LOT-TN-2026-0888 resolved ({disputeResolved === 'upheld' ? 'Agent Upheld - Canonical Grade B' : 'Grade Corrected to Buyer - Grade C'}). Block appended to ledger.
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-space-sm pt-2">
                    <button
                      className="w-full sm:w-auto px-space-lg py-2.5 bg-primary text-on-primary font-label-lg text-label-lg font-bold rounded-lg shadow-sm hover:bg-primary-container active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      onClick={() => handleDisputeAction('upheld')}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">gavel</span>
                      <span>Resolve Dispute: Agent Upheld (Append Block)</span>
                    </button>
                    <button
                      className="w-full sm:w-auto px-space-lg py-2.5 bg-error text-on-error font-label-lg text-label-lg font-bold rounded-lg shadow-sm hover:bg-error/90 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      onClick={() => handleDisputeAction('buyer')}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit_note</span>
                      <span>Resolve Dispute: Grade Corrected to Buyer</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Procurement e-Slip Modal */}
      {showSlipModal && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="w-full max-w-xl bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="bg-primary text-on-primary p-space-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">receipt</span>
                <span className="font-headline-sm font-bold">APMC Mandi Procurement e-Slip</span>
              </div>
              <button
                onClick={() => setShowSlipModal(false)}
                className="text-on-primary hover:opacity-80 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-space-lg flex flex-col gap-space-md font-body-sm">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-code-md font-bold text-primary">SLIP #APMC-THJ-2026-0891</span>
                <span className="font-code-sm text-outline">Date: 2026-03-30</span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-code-sm">
                <div>
                  <span className="text-outline">Buyer:</span>{' '}
                  <strong className="text-on-surface">Kaveri Rice Mills Ltd.</strong>
                </div>
                <div>
                  <span className="text-outline">Farmer:</span>{' '}
                  <strong className="text-on-surface">K. Raman</strong>
                </div>
                <div>
                  <span className="text-outline">Commodity:</span> Paddy (Ponni Raw)
                </div>
                <div>
                  <span className="text-outline">Quantity:</span> 3,200 kg (64 Bags)
                </div>
                <div>
                  <span className="text-outline">Arbitrated Grade:</span>{' '}
                  <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-bold">GRADE A</span>
                </div>
                <div>
                  <span className="text-outline">Payable MSP:</span> ₹2,320 / Quintal (₹74,240 Total)
                </div>
              </div>
              <div className="bg-surface-container p-3 rounded text-[11px] font-mono break-all">
                BLOCK RECEIPT HASH: 0x9f18a20de3819c991a02195fbc9a772c5b91af02881a2938c9284190284ab910
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowSlipModal(false)}
                  className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg cursor-pointer hover:bg-primary-container"
                >
                  Download Signed e-Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
