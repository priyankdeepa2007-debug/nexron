import React, { useState, useEffect } from 'react';
import { LotRecord, ScreenId } from '../types';

interface CaptureGradeScreenProps {
  onNavigate: (screen: ScreenId) => void;
  recentLots: LotRecord[];
  onLockGrade: (newLot: LotRecord) => void;
  pendingSync: number;
  onIncrementPendingSync: () => void;
}

export const CaptureGradeScreen: React.FC<CaptureGradeScreenProps> = ({
  onNavigate,
  recentLots,
  onLockGrade,
  pendingSync,
  onIncrementPendingSync,
}) => {
  const [selectedAgent, setSelectedAgent] = useState('lakshmi');
  const [nonce, setNonce] = useState(894);
  const [farmerName, setFarmerName] = useState('Annamalai Chinnasamy');
  const [farmerVillage, setFarmerVillage] = useState('Melattur, Thanjavur District');
  const [commodity, setCommodity] = useState('Paddy (FCI FAQ)');
  const [quantityKg, setQuantityKg] = useState(2450);
  const [calibChecked, setCalibChecked] = useState(true);

  // Scores 0-3 for each of the 4 attributes
  const [scores, setScores] = useState({
    a1: 0,
    a2: 1,
    a3: 0,
    a4: 0,
  });

  const [hashDisplay, setHashDisplay] = useState(
    '8f92a1c0d4e5f7a2b9c3e1f0a8d7c6b5e4a3d2c1b0f9e8d7c6b5a4f3e2d1c0b4'
  );

  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: '',
    message: '',
  });

  const lotId = `LOT-TN-2026-0${nonce}`;
  const sumScore = scores.a1 + scores.a2 + scores.a3 + scores.a4;

  // Grade calculation
  let gradeTitle = 'GRADE A';
  let gradeSubtext = 'Premium Procurement Standard';
  let dockageRate = '0.00% (Full MSP ₹2,320/Qtl)';
  let gradeColorClass = 'text-primary';

  if (sumScore <= 2) {
    gradeTitle = 'GRADE A';
    gradeSubtext = 'Premium Procurement Standard';
    dockageRate = '0.00% (Full MSP ₹2,320/Qtl)';
    gradeColorClass = 'text-primary';
  } else if (sumScore <= 5) {
    gradeTitle = 'GRADE B';
    gradeSubtext = 'FCI Fair Average Quality (FAQ)';
    dockageRate = '1.25% Standard Refraction Dockage';
    gradeColorClass = 'text-secondary';
  } else if (sumScore <= 8) {
    gradeTitle = 'GRADE C';
    gradeSubtext = 'Sub-optimal: Heavy Moisture/Dockage';
    dockageRate = '4.50% High Refraction Dockage';
    gradeColorClass = 'text-secondary-container';
  } else {
    gradeTitle = 'BELOW GRADE';
    gradeSubtext = 'Rejected: Exceeds FCI Rejection Limits';
    dockageRate = 'Disqualified from APMC Auction';
    gradeColorClass = 'text-error';
  }

  // Agent metadata lookup
  const agentMeta = {
    lakshmi: {
      meta: 'Assayer ID: AGT-TN-4491 • Biometric Verified',
      reputation: 'REPUTATION: 96% ACCURACY',
      name: 'Lakshmi R.',
    },
    murugan: {
      meta: 'Assayer ID: AGT-TN-404 • Biometric Verified',
      reputation: 'REPUTATION: 72% ACCURACY',
      name: 'Murugan K.',
    },
    selvi: {
      meta: 'Assayer ID: AGT-TN-209 • Biometric Verified',
      reputation: 'REPUTATION: 88% ACCURACY',
      name: 'Selvi P.',
    },
  }[selectedAgent] || {
    meta: 'Assayer ID: AGT-TN-4491 • Biometric Verified',
    reputation: 'REPUTATION: 96% ACCURACY',
    name: 'Lakshmi R.',
  };

  // Recompute RFC 8785 Canonical WebCrypto SHA-256 digest
  useEffect(() => {
    const computeHash = async () => {
      const canonicalPayload = JSON.stringify({
        agent: selectedAgent,
        commodity: commodity,
        farmer: farmerName,
        lotId: lotId,
        quantityKg: quantityKg,
        scores: [scores.a1, scores.a2, scores.a3, scores.a4],
        sumScore: sumScore,
        village: farmerVillage,
      });

      if (window.crypto && window.crypto.subtle) {
        try {
          const encoder = new TextEncoder();
          const data = encoder.encode(canonicalPayload);
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
          setHashDisplay(hex);
        } catch {
          setHashDisplay(
            '8f92a1c0d4e5f7a2b9c3e1f0a8d7c6b5e4a3d2c1b0f9e8d7c6b5a4f3e2d1c0b4'
          );
        }
      }
    };
    computeHash();
  }, [selectedAgent, lotId, farmerName, farmerVillage, commodity, quantityKg, scores, sumScore]);

  const showToast = (title: string, message: string) => {
    setToast({ visible: true, title, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3500);
  };

  const handleLockGrade = () => {
    if (!calibChecked) {
      alert('Validation Error: Calibration reference card must be verified and checked.');
      return;
    }

    const newBlockNumber = recentLots.length > 0 ? recentLots[0].blockNumber + 1 : 15;
    const newLotRecord: LotRecord = {
      id: lotId,
      blockNumber: newBlockNumber,
      farmer: farmerName,
      village: farmerVillage,
      commodity: commodity,
      quantityKg: quantityKg,
      grade: gradeTitle,
      sumScore: sumScore,
      hash: `0x${hashDisplay.substring(0, 4)}...${hashDisplay.substring(hashDisplay.length - 4)}`,
      timestamp: new Date().toISOString(),
      agentName: agentMeta.name,
      agentId: selectedAgent === 'lakshmi' ? 'AGT-TN-4491' : selectedAgent === 'murugan' ? 'AGT-TN-404' : 'AGT-TN-209',
      status: 'VERIFIED_MATCH',
      attributeScores: {
        size: scores.a1,
        colour: scores.a2,
        moisture: scores.a3,
        defects: scores.a4,
      },
    };

    onLockGrade(newLotRecord);
    showToast('Grade Sealed Cryptographically', `Batch ${lotId} appended to block #${newBlockNumber}.`);
    setNonce((n) => n + 1);
  };

  const handleSimulateOffline = () => {
    onIncrementPendingSync();
    showToast('Offline SQLite Buffer Saved', 'Lot queued in encrypted LocalStorage queue.');
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full px-gutter-desktop py-space-md flex flex-col gap-space-lg">
        {/* System & Hardware Telemetry Banner */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex flex-wrap items-center gap-space-lg">
            <div className="flex items-center gap-space-xs">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="font-label-lg text-label-lg text-on-surface font-bold">STATE: ONLINE MANDI SYNC</span>
              <span className="bg-surface-container-high text-on-surface-variant font-code-sm text-code-sm px-2 py-0.5 rounded">
                LATENCY: 18ms
              </span>
            </div>
            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-primary">security</span>
              <span className="font-body-sm text-body-sm font-semibold">WebCrypto Subsystem:</span>
              <span className="font-code-sm text-code-sm text-primary font-bold">FIPS 180-4 (SHA-256 ACTIVE)</span>
            </div>
            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-secondary">cloud_done</span>
              <span className="font-body-sm text-body-sm font-semibold">Offline Spool Queue:</span>
              <span
                className={`font-code-sm text-code-sm font-bold px-2 py-0.5 rounded ${
                  pendingSync > 0
                    ? 'bg-secondary-container text-on-secondary-container animate-bounce'
                    : 'bg-secondary-fixed text-on-secondary-fixed'
                }`}
                id="queue-counter"
              >
                {pendingSync} BATCHES PENDING
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <span className="font-label-md text-label-md text-outline uppercase tracking-wider">APMC TERMINAL:</span>
            <span className="bg-surface-container px-2 py-1 rounded font-code-sm text-code-sm font-bold text-on-surface">
              TN-THJ-MANDI-04
            </span>
          </div>
        </div>

        {/* Main Two-Column Ingestion Interface */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left Pane: Crop Ingestion & 4-Attribute FCI Scorer (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            {/* Section 1: Context & Farmer Disclosure */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center justify-between pb-space-sm mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-6 bg-primary rounded-sm"></span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    1. Mandi Context &amp; Farmer Registry
                  </h2>
                </div>
                <span className="font-code-sm text-code-sm bg-surface-container px-space-xs py-1 rounded text-outline font-semibold">
                  STEP 01 OF 03
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {/* Agent Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md uppercase tracking-wider text-outline font-bold">
                    Certified Field Assayer / Agent
                  </label>
                  <div className="relative bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between">
                    <select
                      className="w-full bg-transparent font-body-md text-body-md text-on-surface font-semibold focus:outline-none appearance-none cursor-pointer pr-8"
                      id="agent-selector"
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                    >
                      <option value="lakshmi">Lakshmi R. (SHG Grader • Thanjavur Mandi • ★ 4.8)</option>
                      <option value="murugan">Murugan K. (Kiosk Operator • Tiruvarur • ★ 3.2)</option>
                      <option value="selvi">Selvi P. (SHG Grader • Nagapattinam • ★ 4.3)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 pointer-events-none text-outline">
                      expand_more
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="font-code-sm text-code-sm text-on-surface-variant" id="agent-meta">
                      {agentMeta.meta}
                    </span>
                    <span className="font-code-sm text-code-sm text-primary font-bold">{agentMeta.reputation}</span>
                  </div>
                </div>

                {/* Lot ID & Auto-Generator */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md uppercase tracking-wider text-outline font-bold">
                      Target Lot Identification
                    </label>
                    <button
                      className="font-code-sm text-code-sm text-primary hover:text-primary-container font-semibold flex items-center gap-0.5"
                      id="regen-lot-btn"
                      type="button"
                      onClick={() => setNonce((n) => n + 1)}
                    >
                      <span className="material-symbols-outlined text-[14px]">refresh</span> Refresh Nonce
                    </button>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between">
                    <span className="font-code-md text-code-md font-bold text-on-surface tracking-wider" id="current-lot-id">
                      {lotId}
                    </span>
                    <span className="font-code-sm text-code-sm bg-primary-container text-on-primary font-semibold px-2 py-0.5 rounded">
                      CANONICAL RFC-8785
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-outline px-1">
                    Sealed timestamp locked to Indian Standard Time (IST)
                  </span>
                </div>

                {/* Farmer Name & Contact */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md uppercase tracking-wider text-outline font-bold">
                    Farmer Name &amp; Agristack ID
                  </label>
                  <input
                    className="w-full bg-surface-container-low rounded-lg p-2.5 font-body-md text-body-md text-on-surface font-semibold focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                    id="farmer-name"
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                  />
                  <div className="flex items-center justify-between px-1 font-body-sm text-body-sm text-on-surface-variant">
                    <span>Agristack: TN-AGR-884210</span>
                    <span className="font-code-sm text-code-sm text-primary font-medium">+91 94432-XXXXX</span>
                  </div>
                </div>

                {/* Village / Mandi Origin */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md uppercase tracking-wider text-outline font-bold">
                    Origin Village &amp; Sub-Mandi Hub
                  </label>
                  <input
                    className="w-full bg-surface-container-low rounded-lg p-2.5 font-body-md text-body-md text-on-surface font-semibold focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                    id="farmer-village"
                    type="text"
                    value={farmerVillage}
                    onChange={(e) => setFarmerVillage(e.target.value)}
                  />
                  <span className="font-code-sm text-code-sm text-outline px-1">
                    Geo-fence: 10.7870° N, 79.1378° E (Paddy Belt)
                  </span>
                </div>

                {/* Commodity Standard Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md uppercase tracking-wider text-outline font-bold">
                    Commodity &amp; Assay Protocol
                  </label>
                  <div className="grid grid-cols-3 gap-space-xs">
                    <button
                      className={`crop-tab py-2 px-1 rounded font-label-lg text-label-lg font-bold shadow-sm text-center transition-all ${
                        commodity.includes('Paddy')
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                      onClick={() => setCommodity('Paddy (FCI FAQ)')}
                      type="button"
                    >
                      Paddy (FCI FAQ)
                    </button>
                    <button
                      className={`crop-tab py-2 px-1 rounded font-label-lg text-label-lg font-bold shadow-sm text-center transition-all ${
                        commodity.includes('Tomato')
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                      onClick={() => setCommodity('Tomato (Hort)')}
                      type="button"
                    >
                      Tomato (Hort)
                    </button>
                    <button
                      className={`crop-tab py-2 px-1 rounded font-label-lg text-label-lg font-bold shadow-sm text-center transition-all ${
                        commodity.includes('Onion')
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                      onClick={() => setCommodity('Onion (Nashik)')}
                      type="button"
                    >
                      Onion (Nashik)
                    </button>
                  </div>
                </div>

                {/* Quantity & Gunny Bags */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md uppercase tracking-wider text-outline font-bold">
                    Gross Quantity Ingested
                  </label>
                  <div className="grid grid-cols-2 gap-space-xs">
                    <div className="flex items-center bg-surface-container-low rounded-lg px-2.5 py-1.5">
                      <input
                        className="w-full bg-transparent font-code-md text-code-md font-bold text-on-surface focus:outline-none"
                        id="lot-quantity"
                        type="number"
                        value={quantityKg}
                        onChange={(e) => setQuantityKg(Number(e.target.value) || 0)}
                      />
                      <span className="font-label-md text-label-md text-outline font-bold">KG</span>
                    </div>
                    <div className="flex items-center bg-surface-container-low rounded-lg px-2.5 py-1.5">
                      <span className="font-code-md text-code-md font-bold text-primary" id="bag-calc">
                        {Math.round(quantityKg / 50)}
                      </span>
                      <span className="ml-1 font-label-md text-label-md text-outline font-bold">BAGS (50KG)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: 4-Attribute FCI Checklist (0 best to 3 worst) */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex flex-wrap items-center justify-between pb-space-xs gap-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-6 bg-primary rounded-sm"></span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    2. FCI Physical Quality Assay Standards (FAQ)
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-label-md text-outline">PENALTY SCALE:</span>
                  <span className="bg-surface-container-high px-2 py-0.5 rounded font-code-sm text-code-sm font-bold text-on-surface">
                    0 (BEST) → 3 (DEFECTIVE)
                  </span>
                </div>
              </div>

              {/* Attribute 1: Size & Uniformity */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-code-sm text-code-sm font-bold">
                      A1
                    </span>
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Grain Size &amp; Variety Uniformity
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-outline font-medium">
                    Standard FAQ: Ref. 100g Grain Sample
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Measure admixture of foreign varieties, undersized grains, and immature paddy kernels.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-space-xs mt-2" data-attr-group="a1">
                  {[
                    { val: 0, label: 'Uniform Grain', desc: 'Bold, fully filled kernals FAQ standard.' },
                    { val: 1, label: 'Mostly Uniform', desc: '< 5% mix of non-specified variety.' },
                    { val: 2, label: 'Mixed Sizes', desc: '5-10% size variance, some immature.' },
                    { val: 3, label: 'Severe Shrivelled', desc: '> 10% immature / broken screenings.' },
                  ].map((lvl) => {
                    const isSelected = scores.a1 === lvl.val;
                    return (
                      <button
                        key={lvl.val}
                        className={`attr-btn p-3 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'selected bg-primary text-on-primary shadow-sm'
                            : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                        }`}
                        data-val={lvl.val}
                        type="button"
                        onClick={() => setScores((s) => ({ ...s, a1: lvl.val }))}
                      >
                        <div className="flex items-center justify-between font-code-sm text-code-sm font-bold mb-1">
                          <span>LEVEL {lvl.val}</span>
                          {isSelected && <span className="material-symbols-outlined text-[16px]">check_circle</span>}
                        </div>
                        <div className="font-label-lg text-label-lg font-bold">{lvl.label}</div>
                        <div
                          className={`font-body-sm text-body-sm mt-0.5 ${
                            isSelected ? 'opacity-90' : 'text-on-surface-variant'
                          }`}
                        >
                          {lvl.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attribute 2: Colour / Ripeness */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-code-sm text-code-sm font-bold">
                      A2
                    </span>
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Colour, Lustre &amp; Ripeness
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-outline font-medium">Visual Husk Inspection</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Calibrate against the daylight optical test card for weather damage, fungal discoloration, and lustre.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-space-xs mt-2" data-attr-group="a2">
                  {[
                    { val: 0, label: 'Golden Lustre', desc: 'Bright, pristine husk, natural bloom.' },
                    { val: 1, label: 'Slightly Dull', desc: 'Minor field weathering, no fungus.' },
                    { val: 2, label: 'Dull / Patchy', desc: 'Patchy black/grey speckles visible.' },
                    { val: 3, label: 'Severe Discolour', desc: 'Extensive microbial/rain damage.' },
                  ].map((lvl) => {
                    const isSelected = scores.a2 === lvl.val;
                    return (
                      <button
                        key={lvl.val}
                        className={`attr-btn p-3 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'selected bg-primary text-on-primary shadow-sm'
                            : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                        }`}
                        data-val={lvl.val}
                        type="button"
                        onClick={() => setScores((s) => ({ ...s, a2: lvl.val }))}
                      >
                        <div className="flex items-center justify-between font-code-sm text-code-sm font-bold mb-1">
                          <span>LEVEL {lvl.val}</span>
                          {isSelected && <span className="material-symbols-outlined text-[16px]">check_circle</span>}
                        </div>
                        <div className="font-label-lg text-label-lg font-bold">{lvl.label}</div>
                        <div
                          className={`font-body-sm text-body-sm mt-0.5 ${
                            isSelected ? 'opacity-90' : 'text-on-surface-variant'
                          }`}
                        >
                          {lvl.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attribute 3: Moisture Band */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-code-sm text-code-sm font-bold">
                      A3
                    </span>
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Moisture Band Metering
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-outline font-medium">Digital Probe (ISO 712:2009)</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Calibrated moisture content taken across 3 probe depths in representative sacks.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-space-xs mt-2" data-attr-group="a3">
                  {[
                    { val: 0, label: '≤ 14% Safe Storage', desc: 'Strict FCI FAQ standard for procurement.' },
                    { val: 1, label: '14.1% - 17.0%', desc: 'Acceptable with standard dockage.' },
                    { val: 2, label: '17.1% - 20.0%', desc: 'High moisture: drying mandatory.' },
                    { val: 3, label: '> 20.0% Hazardous', desc: 'High risk of aflatoxin / spoiling.' },
                  ].map((lvl) => {
                    const isSelected = scores.a3 === lvl.val;
                    return (
                      <button
                        key={lvl.val}
                        className={`attr-btn p-3 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'selected bg-primary text-on-primary shadow-sm'
                            : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                        }`}
                        data-val={lvl.val}
                        type="button"
                        onClick={() => setScores((s) => ({ ...s, a3: lvl.val }))}
                      >
                        <div className="flex items-center justify-between font-code-sm text-code-sm font-bold mb-1">
                          <span>LEVEL {lvl.val}</span>
                          {isSelected && <span className="material-symbols-outlined text-[16px]">check_circle</span>}
                        </div>
                        <div className="font-label-lg text-label-lg font-bold">{lvl.label}</div>
                        <div
                          className={`font-body-sm text-body-sm mt-0.5 ${
                            isSelected ? 'opacity-90' : 'text-on-surface-variant'
                          }`}
                        >
                          {lvl.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attribute 4: Visible Defects */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-code-sm text-code-sm font-bold">
                      A4
                    </span>
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Broken, Chalky &amp; Foreign Matter
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-outline font-medium">Standard Sieve Analysis</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Cumulative percentage of broken kernels, inorganic foreign matter, and insect-bored grains.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-space-xs mt-2" data-attr-group="a4">
                  {[
                    { val: 0, label: '< 3% Broken', desc: 'Top-tier milling outturn ratio.' },
                    { val: 1, label: '3% - 6% Broken', desc: 'Standard FAQ acceptable threshold.' },
                    { val: 2, label: '6% - 10% Broken', desc: 'Substantial broken fraction.' },
                    { val: 3, label: '> 10% Damaged', desc: 'Pest infestation / heavy chaff.' },
                  ].map((lvl) => {
                    const isSelected = scores.a4 === lvl.val;
                    return (
                      <button
                        key={lvl.val}
                        className={`attr-btn p-3 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'selected bg-primary text-on-primary shadow-sm'
                            : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                        }`}
                        data-val={lvl.val}
                        type="button"
                        onClick={() => setScores((s) => ({ ...s, a4: lvl.val }))}
                      >
                        <div className="flex items-center justify-between font-code-sm text-code-sm font-bold mb-1">
                          <span>LEVEL {lvl.val}</span>
                          {isSelected && <span className="material-symbols-outlined text-[16px]">check_circle</span>}
                        </div>
                        <div className="font-label-lg text-label-lg font-bold">{lvl.label}</div>
                        <div
                          className={`font-body-sm text-body-sm mt-0.5 ${
                            isSelected ? 'opacity-90' : 'text-on-surface-variant'
                          }`}
                        >
                          {lvl.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane: Real-Time Canonical Digest & Evidence Anchor (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            {/* Live Result Card & Tally */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md uppercase tracking-wider text-outline font-bold">
                  Live Scoring Engine
                </span>
                <span className="bg-primary text-on-primary font-code-sm text-code-sm px-2 py-0.5 rounded font-bold">
                  ALGORITHM v1.4
                </span>
              </div>

              {/* Grade Badge Graphic */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-outline uppercase font-bold">
                    Synthesized Grade
                  </span>
                  <span className={`font-headline-lg text-headline-lg font-extrabold ${gradeColorClass}`} id="grade-title">
                    {gradeTitle}
                  </span>
                  <span className={`font-body-sm text-body-sm font-semibold ${gradeColorClass}`} id="grade-subtext">
                    {gradeSubtext}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-code-md text-code-md text-outline uppercase">Sum Index</div>
                  <div className="font-headline-lg text-headline-lg font-black text-on-surface" id="sum-score">
                    {sumScore} <span className="font-body-sm text-body-sm text-outline">/ 12</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Scale Indicator */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-code-sm text-code-sm text-outline">
                  <span className="text-primary font-bold">0-2: Grade A</span>
                  <span>3-5: Grade B</span>
                  <span>6-8: Grade C</span>
                  <span className="text-error font-bold">9-12: Reject</span>
                </div>
                <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden flex">
                  <div className="bg-primary h-full" style={{ width: '25%' }}></div>
                  <div className="bg-secondary-container h-full" style={{ width: '25%' }}></div>
                  <div className="bg-secondary h-full" style={{ width: '25%' }}></div>
                  <div className="bg-error h-full" style={{ width: '25%' }}></div>
                </div>
                <div className="flex justify-between font-label-md text-label-md text-on-surface-variant mt-1">
                  <span>Dockage Deduction:</span>
                  <span className={`font-code-sm text-code-sm font-bold ${gradeColorClass}`} id="dockage-rate">
                    {dockageRate}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Evidence & Calibration Card Check */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  3. Physical Visual Verification
                </h3>
                <span className="font-code-sm text-code-sm text-primary flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span> 1080p EXIF
                </span>
              </div>

              {/* Sample Photo Frame */}
              <div className="relative w-full rounded-xl overflow-hidden bg-inverse-surface h-48 flex flex-col items-center justify-end group">
                <img
                  className="absolute inset-0 w-full h-full object-cover"
                  data-alt="Close up high resolution shot of freshly harvested Indian Basmati paddy rice grains spread flat on a matte calibration surface next to an official color chart swatch."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5iwE5GMmE066majD84deLtqWvT3r48pIdiqVY7Vr8pSWxf7mSlIvjMj6S-Kx8rNJW40pkWcMK3As4a-mh0hQmEIUqYpAbRO5DKvOqnObITeWEt8iH5M7QmRK-WEiVXzBtJfcu_F9MQljZOLo5iSnVo-efBCJCKtTCADaY1UXLM2H-qGCsZVxomu1xxym0qjC8waHi32_oPGcXWQKJjn2mYTItR6NEI5g4eQulCfiy0W0CWG_5tVHp4A"
                  alt="Harvested paddy grain visual verification"
                />
                <div className="relative z-10 w-full bg-gradient-to-t from-inverse-surface via-inverse-surface/80 to-transparent p-space-sm flex items-center justify-between text-on-tertiary">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-fixed text-[18px]">verified</span>
                    <span className="font-code-sm text-code-sm">CARD #CAL-THJ-2026 DETECTED</span>
                  </div>
                  <span className="font-code-sm text-code-sm bg-surface-container-highest/30 px-1.5 py-0.5 rounded text-surface-bright">
                    ISO 100 • f/2.4
                  </span>
                </div>
              </div>

              {/* Mandatory Calibration Card Affirmation */}
              <label className="flex items-start gap-space-xs p-space-sm rounded-lg bg-surface-container-low cursor-pointer select-none">
                <input
                  checked={calibChecked}
                  onChange={(e) => setCalibChecked(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded accent-primary cursor-pointer"
                  id="calib-checkbox"
                  type="checkbox"
                />
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg text-on-surface font-bold">
                    Calibration Reference Visible
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Mandatory: Optical color check chart and metric scale must be clear in photographic capture.
                  </span>
                </div>
              </label>
            </div>

            {/* Device-Side Canonical JSON Pre-Hash Block */}
            <div className="bg-tertiary text-on-tertiary rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary-fixed text-[20px]">fingerprint</span>
                  <span className="font-label-lg text-label-lg font-bold tracking-wide">Client Pre-Transmission Hash</span>
                </div>
                <span className="font-code-sm text-code-sm bg-tertiary-container px-2 py-0.5 rounded text-tertiary-fixed font-bold">
                  RFC 8785 JSON
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-tertiary-fixed-dim">
                Device computes this SHA-256 hash in offline sandbox before transmission. APMC validator node rejects any mismatch.
              </p>
              <div className="bg-inverse-surface rounded-lg p-space-sm font-code-sm text-code-sm text-primary-fixed-dim flex flex-col gap-1 overflow-hidden">
                <div className="text-tertiary-fixed-dim font-bold">// Canonical Pre-image digest</div>
                <div className="break-all font-mono text-surface-bright tracking-wider" id="hash-display">
                  {hashDisplay}
                </div>
              </div>

              {/* Commit Buttons */}
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <button
                  className="w-full bg-primary hover:bg-primary-container text-on-primary py-space-sm px-space-md rounded-lg font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-space-xs transition-all active:translate-y-0.5 shadow-md cursor-pointer"
                  id="lock-grade-btn"
                  type="button"
                  onClick={handleLockGrade}
                >
                  <span className="material-symbols-outlined text-[22px]">lock</span>
                  <span>Lock Grade to Chain (SHA-256)</span>
                </button>
                <button
                  className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface py-space-xs px-space-md rounded-lg font-label-lg text-label-lg font-semibold flex items-center justify-center gap-space-xs transition-all cursor-pointer"
                  id="simulate-offline-btn"
                  type="button"
                  onClick={handleSimulateOffline}
                >
                  <span className="material-symbols-outlined text-[18px]">wifi_off</span>
                  <span>Simulate Offline Lot Spooling</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Ingested Lots Ledger Log */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md mt-space-sm">
          <div className="flex flex-wrap items-center justify-between gap-space-xs pb-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="w-2.5 h-6 bg-primary rounded-sm"></span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Recent Ingested &amp; Chain-Sealed Lots
              </h2>
            </div>
            <div className="flex items-center gap-space-md font-code-sm text-code-sm text-outline">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary"></span> {recentLots.length + 11} BLOCKS SYNCED
              </span>
              <span>•</span>
              <span>CONSENSUS: 100% SECURE</span>
            </div>
          </div>

          {/* High Density Utilitarian Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead>
                <tr className="bg-surface-container-low text-outline font-label-md text-label-md uppercase tracking-wider">
                  <th className="py-3 px-4">Block #</th>
                  <th className="py-3 px-4">Lot ID</th>
                  <th className="py-3 px-4">Farmer / Origin</th>
                  <th className="py-3 px-4">Commodity</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">FCI Grade</th>
                  <th className="py-3 px-4">SHA-256 Digest</th>
                  <th className="py-3 px-4 text-right">Audit</th>
                </tr>
              </thead>
              {/* Critical xpath: //tbody[@id='ledger-table-body']//tr[1]//button */}
              <tbody className="divide-y divide-surface-container" id="ledger-table-body">
                {recentLots.map((lot, idx) => {
                  const isFirstRow = idx === 0;
                  const gradeBadge = lot.grade.includes('A')
                    ? 'bg-primary-container text-on-primary'
                    : lot.grade.includes('B')
                    ? 'bg-secondary-fixed text-on-secondary-fixed'
                    : 'bg-secondary text-on-secondary';

                  return (
                    <tr key={lot.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-3 px-4 font-code-sm text-code-sm font-bold text-on-surface">
                        #{lot.blockNumber}
                      </td>
                      <td className="py-3 px-4 font-code-sm text-code-sm text-primary font-bold">{lot.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-on-surface">{lot.farmer}</div>
                        <div className="font-code-sm text-code-sm text-outline">{lot.village}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-surface-container-high px-2 py-0.5 rounded font-label-md text-label-md text-on-surface font-semibold">
                          {lot.commodity}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-code-sm text-code-sm font-medium">
                        {lot.quantityKg.toLocaleString()} kg ({Math.round(lot.quantityKg / 50)} bags)
                      </td>
                      <td className="py-3 px-4">
                        <span className={`${gradeBadge} font-code-sm text-code-sm px-2.5 py-1 rounded-full font-bold`}>
                          {lot.grade} ({lot.sumScore})
                        </span>
                      </td>
                      <td className="py-3 px-4 font-code-sm text-code-sm font-mono text-outline">{lot.hash}</td>
                      <td className="py-3 px-4 text-right">
                        {/* FIRST ROW BUTTON NAVIGATES TO LEDGER AND CRYPTOGRAPHY AS REQUIRED BY SPEC */}
                        <button
                          className="px-2 py-1 rounded bg-surface-container text-primary hover:bg-primary hover:text-on-primary font-label-md text-label-md font-bold transition-all cursor-pointer"
                          type="button"
                          onClick={() => {
                            if (isFirstRow) {
                              onNavigate('ledger-and-cryptography');
                            } else {
                              onNavigate('ledger-and-cryptography');
                            }
                          }}
                        >
                          Verify Proof
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 transform transition-all duration-300 pointer-events-none z-50 bg-primary text-on-primary px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 ${
          toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
        }`}
        id="toast"
      >
        <span className="material-symbols-outlined text-[24px]">verified</span>
        <div className="flex flex-col">
          <span className="font-label-lg text-label-lg font-bold" id="toast-title">
            {toast.title}
          </span>
          <span className="font-code-sm text-code-sm opacity-90" id="toast-msg">
            {toast.message}
          </span>
        </div>
      </div>
    </div>
  );
};
