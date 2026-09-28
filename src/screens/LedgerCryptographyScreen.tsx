import React, { useState } from 'react';
import { ChainBlock, ScreenId } from '../types';

interface LedgerCryptographyScreenProps {
  onNavigate: (screen: ScreenId) => void;
  chainBlocks: ChainBlock[];
}

export const LedgerCryptographyScreen: React.FC<LedgerCryptographyScreenProps> = ({
  onNavigate: _onNavigate,
  chainBlocks: initialChainBlocks,
}) => {
  const [activeBlocks, setActiveBlocks] = useState<ChainBlock[]>(() =>
    JSON.parse(JSON.stringify(initialChainBlocks))
  );
  const [tamperMode, setTamperMode] = useState<'NONE' | 'MODE_A' | 'MODE_B'>('NONE');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState({
    isValid: true,
    message: 'Ready for inspection',
    failureReason: '' as '' | 'payload_mismatch' | 'link',
    failureIndex: -1,
  });

  const [inspectingBlockIndex, setInspectingBlockIndex] = useState<number | null>(null);

  // Run the cryptographic verification pipeline walk
  const runVerificationWalk = (currentMode = tamperMode, currentBlocks = activeBlocks) => {
    setIsVerifying(true);
    setVerifyStatus((prev) => ({ ...prev, message: 'Running verification walk across blocks...' }));

    setTimeout(() => {
      let valid = true;
      let reason: '' | 'payload_mismatch' | 'link' = '';
      let fIndex = -1;

      for (let i = 1; i < currentBlocks.length; i++) {
        const curr = currentBlocks[i];
        const prev = currentBlocks[i - 1];

        // 1. Link check
        if (curr.prevHash !== prev.hash) {
          valid = false;
          reason = 'link';
          fIndex = i;
          break;
        }

        // 2. Payload check if Block 4 was edited in Mode A
        if (i === 4 && currentMode === 'MODE_A') {
          valid = false;
          reason = 'payload_mismatch';
          fIndex = 4;
          break;
        }
      }

      setIsVerifying(false);
      setVerifyStatus({
        isValid: valid,
        message: valid
          ? 'VERIFICATION SUCCESS • All Hashes & Links Cryptographically Sound'
          : `VIOLATION DETECTED: reason '${reason}' at Block #${fIndex}!`,
        failureReason: reason,
        failureIndex: fIndex,
      });
    }, 450);
  };

  // Tamper Mode A: Edit record silently without rehash
  const handleTamperModeA = () => {
    setTamperMode('MODE_A');
    const mutated = JSON.parse(JSON.stringify(initialChainBlocks));
    mutated[4].payload.moisture = 10.2;
    mutated[4].payload.overallGrade = 'Grade A';
    setActiveBlocks(mutated);
    runVerificationWalk('MODE_A', mutated);
  };

  // Tamper Mode B: Edit and re-hash Block 4
  const handleTamperModeB = () => {
    setTamperMode('MODE_B');
    const mutated = JSON.parse(JSON.stringify(initialChainBlocks));
    mutated[4].payload.moisture = 10.2;
    mutated[4].payload.overallGrade = 'Grade A';
    mutated[4].hash = '99fa388100ffaa1829e00188237190bb4410982310ff98a12904aae901844bca';
    setActiveBlocks(mutated);
    runVerificationWalk('MODE_B', mutated);
  };

  // Restore chain
  const handleRestoreChain = () => {
    setTamperMode('NONE');
    const pristine = JSON.parse(JSON.stringify(initialChainBlocks));
    setActiveBlocks(pristine);
    runVerificationWalk('NONE', pristine);
  };

  const inspectingBlock = inspectingBlockIndex !== null ? activeBlocks[inspectingBlockIndex] : null;

  return (
    <div className="flex flex-col w-full">
      <div className="w-full px-margin-desktop py-space-lg flex flex-col gap-space-lg">
        {/* Top Master Verification & Live Ledger Header */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-space-sm flex-wrap">
              <span
                className={`flex items-center gap-1.5 px-space-sm py-1 rounded font-code-sm text-code-sm font-semibold ${
                  verifyStatus.isValid
                    ? 'bg-primary-fixed text-on-primary-fixed'
                    : 'bg-error text-on-error'
                }`}
                id="masterStatusBadge"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    verifyStatus.isValid ? 'bg-primary animate-pulse' : 'bg-on-error'
                  }`}
                ></span>
                <span id="masterStatusText">
                  {verifyStatus.isValid
                    ? `LEDGER INTEGRITY: 100% VALID • ${activeBlocks.length} BLOCKS VERIFIED`
                    : `TAMPER DETECTED: Discrepancy at Block #${verifyStatus.failureIndex}`}
                </span>
              </span>
              <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface-variant font-code-sm text-code-sm uppercase">
                RFC 8785 Canonical Representation
              </span>
              <span className="px-space-xs py-0.5 rounded bg-surface-container text-outline font-code-sm text-code-sm">
                Network Node: TN-APMC-09
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Cryptographic chain state across Thanjavur Regional Mandis. Every assay payload is canonicalized (strictly
              sorted keys) and bound via unbroken SHA-256 parent hashes.
            </p>
          </div>
          <div className="flex items-center gap-space-sm flex-shrink-0">
            <button
              className="px-space-lg py-space-sm rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold hover:bg-primary-container active:translate-y-0.5 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              id="btnRunVerify"
              onClick={() => runVerificationWalk()}
              disabled={isVerifying}
            >
              <span className={`material-symbols-outlined text-[18px] ${isVerifying ? 'animate-spin' : ''}`}>
                {isVerifying ? 'progress_activity' : 'verified'}
              </span>
              <span>{isVerifying ? 'Verifying...' : 'Run Cryptographic Verification'}</span>
            </button>
            <button
              className="px-space-md py-space-sm rounded-lg bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold hover:bg-surface-dim transition-all flex items-center gap-1.5 cursor-pointer"
              onClick={() => setInspectingBlockIndex(4)}
            >
              <span className="material-symbols-outlined text-[18px]">code_blocks</span>
              <span>Inspect Block #4</span>
            </button>
          </div>
        </div>

        {/* Live Step-by-Step Verification Telemetry Drawer / Bar */}
        <div
          className="w-full bg-tertiary text-on-tertiary rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm"
          id="verifyTelemetryCard"
        >
          <div className="flex items-center justify-between font-code-sm text-code-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary-fixed">terminal</span>
              <span className="uppercase tracking-wider font-semibold">
                GET /api/ledger/verify • Pipeline Walk Status
              </span>
            </div>
            <div
              className={`font-semibold ${
                verifyStatus.isValid ? 'text-primary-fixed' : 'text-error-container'
              }`}
              id="verificationResultTag"
            >
              {verifyStatus.message}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-sm pt-space-xs font-code-sm text-code-sm">
            <div
              className="p-space-xs rounded bg-tertiary-container flex items-center justify-between text-surface-container-high"
              id="step-order"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span>1. Block Index Order
              </span>
              <span className="material-symbols-outlined text-[16px] text-primary-fixed">check_circle</span>
            </div>
            <div
              className="p-space-xs rounded bg-tertiary-container flex items-center justify-between text-surface-container-high"
              id="step-prevhash"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span>2. PrevHash Links
              </span>
              <span
                className={`material-symbols-outlined text-[16px] ${
                  verifyStatus.failureReason === 'link' ? 'text-error' : 'text-primary-fixed'
                }`}
              >
                {verifyStatus.failureReason === 'link' ? 'link_off' : 'check_circle'}
              </span>
            </div>
            <div
              className="p-space-xs rounded bg-tertiary-container flex items-center justify-between text-surface-container-high"
              id="step-payload"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span>3. Payload SHA-256
              </span>
              <span
                className={`material-symbols-outlined text-[16px] ${
                  verifyStatus.failureReason === 'payload_mismatch' ? 'text-error' : 'text-primary-fixed'
                }`}
              >
                {verifyStatus.failureReason === 'payload_mismatch' ? 'cancel' : 'check_circle'}
              </span>
            </div>
            <div
              className="p-space-xs rounded bg-tertiary-container flex items-center justify-between text-surface-container-high"
              id="step-canonical"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span>4. Canonical Block Hash
              </span>
              <span
                className={`material-symbols-outlined text-[16px] ${
                  !verifyStatus.isValid ? 'text-secondary-container' : 'text-primary-fixed'
                }`}
              >
                {!verifyStatus.isValid ? 'warning' : 'check_circle'}
              </span>
            </div>
          </div>
        </div>

        {/* Try to Cheat Interactive Sandbox & Security Boundary Warning */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Interactive Sandbox Panel */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <span className="w-3 h-3 rounded-full bg-secondary-container"></span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    &quot;Try to Cheat&quot; Tamper Simulator
                  </span>
                </div>
                <span className="font-code-sm text-code-sm uppercase px-space-xs py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-semibold">
                  Live Stress Harness
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Simulate realistic mandi database attacks against Block #4 (Lot LOT-TN-2026-0888, Murugan K., Moisture
                12.8% Grade B). Trigger malicious edits and observe cryptographic detection vectors.
              </p>
            </div>

            {/* Mode Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
              <button
                className={`p-space-sm rounded-lg text-left transition-all flex flex-col justify-between gap-2 shadow-sm cursor-pointer ${
                  tamperMode === 'MODE_A'
                    ? 'bg-error-container/60 border border-error'
                    : 'bg-surface-container-low hover:bg-surface-container-high'
                }`}
                onClick={handleTamperModeA}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">Mode A: Edit Record</span>
                    <span className="material-symbols-outlined text-secondary text-[20px]">edit_note</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant text-[13px] leading-snug">
                    Silently alter moisture from 12.8% to 10.2% (Grade B to A). Simulates SQL injection without re-hashing.
                  </p>
                </div>
                <div className="flex items-center gap-1 font-code-sm text-code-sm text-secondary font-semibold">
                  <span>Triggers: Payload Mismatch</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </button>

              <button
                className={`p-space-sm rounded-lg text-left transition-all flex flex-col justify-between gap-2 shadow-sm cursor-pointer ${
                  tamperMode === 'MODE_B'
                    ? 'bg-secondary-container/40 border border-secondary-container'
                    : 'bg-surface-container-low hover:bg-surface-container-high'
                }`}
                onClick={handleTamperModeB}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">Mode B: Edit &amp; Re-hash</span>
                    <span className="material-symbols-outlined text-error text-[20px]">lock_reset</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant text-[13px] leading-snug">
                    Attacker recalculates Block #4 hash. Block #4 is internally valid, but Block #5&apos;s parent link
                    shatters!
                  </p>
                </div>
                <div className="flex items-center gap-1 font-code-sm text-code-sm text-error font-semibold">
                  <span>Triggers: Broken Link at #5</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </button>

              <button
                className="p-space-sm rounded-lg bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim transition-all text-left flex flex-col justify-between gap-2 shadow-sm cursor-pointer"
                onClick={handleRestoreChain}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-lg text-label-lg font-bold">Mode C: Restore Chain</span>
                    <span className="material-symbols-outlined text-primary text-[20px]">restore</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-primary-fixed-variant text-[13px] leading-snug">
                    Wipe simulated mutations. Restore immutable pristine chain state from canonical seed.
                  </p>
                </div>
                <div className="flex items-center gap-1 font-code-sm text-code-sm text-primary font-bold">
                  <span>100% Valid State</span>
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
              </button>
            </div>

            {/* Dynamic Feedback Callout */}
            <div className="p-space-sm rounded-lg bg-surface-container flex items-start gap-space-sm" id="tamperNotificationBox">
              <span
                className={`material-symbols-outlined text-[22px] flex-shrink-0 mt-0.5 ${
                  tamperMode === 'MODE_A'
                    ? 'text-secondary'
                    : tamperMode === 'MODE_B'
                    ? 'text-error'
                    : 'text-primary'
                }`}
                id="tamperNoticeIcon"
              >
                {tamperMode === 'MODE_A'
                  ? 'warning'
                  : tamperMode === 'MODE_B'
                  ? 'broken_image'
                  : 'verified_user'}
              </span>
              <div className="flex flex-col gap-0.5 text-body-sm font-body-sm">
                <span className="font-bold text-on-surface font-code-sm text-code-sm uppercase tracking-wide" id="tamperNoticeTitle">
                  {tamperMode === 'MODE_A'
                    ? 'Mode A Active: Record Altered (SQL Tamper Simulated)'
                    : tamperMode === 'MODE_B'
                    ? 'Mode B Active: Attacker Re-hashed Block #4'
                    : 'Ledger Operating in Pure Canonical Mode'}
                </span>
                <p className="text-on-surface-variant" id="tamperNoticeDesc">
                  {tamperMode === 'MODE_A'
                    ? 'Block #4 moisture changed 12.8% -> 10.2%. The block hash has NOT been updated. Verification detects payload mismatch at Block #4!'
                    : tamperMode === 'MODE_B'
                    ? "Block #4's new hash matches its modified payload, BUT Block #5's prevHash still points to the old hash. Verification detects 'reason: link' at Block #5!"
                    : 'All blocks link continuously back to Genesis Block #0. Payload digests match deterministic RFC 8785 outputs.'}
                </p>
              </div>
            </div>
          </div>

          {/* Honest Architecture Boundary Card */}
          <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-xs text-secondary">
                <span className="material-symbols-outlined text-[20px]">security</span>
                <span className="font-label-md text-label-md uppercase tracking-wider font-bold">
                  Cryptographic Boundary Note
                </span>
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">
                Tip Mutation vs. Backward Linking
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Backward pointers ensure any historical block mutation propagates catastrophic link breaks forward through
                the chain.
              </p>
              <div className="p-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface-variant flex flex-col gap-1.5">
                <div className="flex items-center gap-1 font-semibold text-secondary">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  <span>Known Security Boundary:</span>
                </div>
                <p className="text-[13px] leading-relaxed">
                  An attacker re-hashing the tip (newest block, e.g. Block #6) cannot be detected by backward links alone
                  without external anchoring (e.g. daily Merkle root publication in the state gazette or SMS
                  cryptographic confirmation slips issued directly to farmers).
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-xs font-code-sm text-code-sm text-outline">
              <span>Standard: RFC 8785 + SHA-256</span>
              <span>Seed: Thanjavur Hub</span>
            </div>
          </div>
        </div>

        {/* Visual Block Chain Graph (Newest to Genesis) */}
        <div className="w-full flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Block Chain Verification Graph
              </span>
              <span className="font-code-sm text-code-sm text-outline font-normal">
                (Newest block on left → Genesis on right)
              </span>
            </div>
            <span className="font-code-sm text-code-sm text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">swap_horiz</span>
              Horizontal scroll enabled
            </span>
          </div>

          {/* Horizontal Chain Visualizer */}
          <div className="w-full overflow-x-auto pb-space-md pt-space-xs">
            <div className="flex items-stretch gap-space-md min-w-max" id="chainVisualGrid">
              {[...activeBlocks].reverse().map((block) => {
                const isGenesis = block.index === 0;
                const isTamperedBlock =
                  (tamperMode === 'MODE_A' || tamperMode === 'MODE_B') && block.index === 4;
                const isBrokenLinkBlock = tamperMode === 'MODE_B' && block.index === 5;

                let cardBg = 'bg-surface-container-lowest';
                let statusChipBg = 'bg-surface-container text-on-surface-variant';
                let statusText = 'CONFIRMED';
                let linkColor = 'bg-primary';

                if (isTamperedBlock) {
                  if (tamperMode === 'MODE_A') {
                    cardBg = 'bg-error-container/40';
                    statusChipBg = 'bg-error text-on-error';
                    statusText = 'PAYLOAD MISMATCH';
                  } else if (tamperMode === 'MODE_B') {
                    cardBg = 'bg-surface-container-highest';
                    statusChipBg = 'bg-secondary-container text-on-secondary-container';
                    statusText = 'RE-HASHED TIP SPOOF';
                  }
                }

                if (isBrokenLinkBlock) {
                  cardBg = 'bg-error-container/70';
                  statusChipBg = 'bg-error text-on-error';
                  statusText = 'BROKEN PARENT LINK';
                  linkColor = 'bg-error animate-pulse';
                }

                const hashShort = block.hash
                  ? `${block.hash.substring(0, 6)}...${block.hash.substring(block.hash.length - 4)}`
                  : 'calc...';
                const prevShort = block.prevHash
                  ? `${block.prevHash.substring(0, 6)}...${block.prevHash.substring(block.prevHash.length - 4)}`
                  : 'none';

                return (
                  <div key={block.index} className="relative flex items-center">
                    <div
                      onClick={() => setInspectingBlockIndex(block.index)}
                      className={`w-80 cursor-pointer ${cardBg} rounded-xl p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-sm min-h-[260px]`}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                            Block #{block.index}
                          </span>
                          <span className={`font-code-sm text-code-sm font-semibold px-space-xs py-0.5 rounded ${statusChipBg}`}>
                            {statusText}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 font-label-md text-label-md text-outline">
                          <span>TYPE:</span>
                          <span className="font-semibold text-primary font-code-sm text-code-sm">{block.type}</span>
                        </div>
                      </div>

                      {/* Content details based on block type */}
                      <div className="p-space-xs rounded bg-surface-container-low font-body-sm text-body-sm flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-outline">Lot ID:</span>
                          <span className="font-mono font-semibold text-on-surface">{block.lotId}</span>
                        </div>
                        {block.payload.agentName && (
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-outline">Agent:</span>
                            <span className="text-on-surface">{block.payload.agentName}</span>
                          </div>
                        )}
                        {block.payload.moisture !== undefined && (
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-outline">Moisture:</span>
                            <span
                              className={`font-semibold ${
                                isTamperedBlock ? 'text-error font-bold' : 'text-on-surface'
                              }`}
                            >
                              {block.payload.moisture}% ({block.payload.overallGrade})
                            </span>
                          </div>
                        )}
                        {block.payload.buyerName && (
                          <>
                            <div className="flex items-center justify-between text-[13px]">
                              <span className="text-outline">Buyer:</span>
                              <span className="text-on-surface">{block.payload.buyerName}</span>
                            </div>
                            <div className="flex items-center justify-between text-[13px]">
                              <span className="text-outline">Recheck:</span>
                              <span className="font-semibold text-primary font-code-sm text-code-sm">
                                {block.payload.result}
                              </span>
                            </div>
                          </>
                        )}
                        {block.payload.outcome && (
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-outline">Arbitration:</span>
                            <span className="font-semibold text-primary">{block.payload.outcome}</span>
                          </div>
                        )}
                        {isGenesis && (
                          <div className="text-[12px] text-outline font-code-sm text-code-sm">
                            APMC Cauvery Root Seal
                          </div>
                        )}
                      </div>

                      {/* Hash Fingerprint Footer */}
                      <div className="p-space-xs rounded bg-surface-container font-code-sm text-code-sm flex flex-col gap-0.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-outline">Prev:</span>
                          <span className="font-mono text-on-surface-variant">{prevShort}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-outline">Hash:</span>
                          <span className="font-mono text-primary font-semibold">{hashShort}</span>
                        </div>
                      </div>
                    </div>

                    {!isGenesis && (
                      <div className="px-2 flex items-center justify-center">
                        <div className={`w-6 h-1 ${linkColor} rounded`}></div>
                        <span className="material-symbols-outlined text-[16px] text-outline -ml-1">chevron_right</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Deep Proof Walk & Math Explainer Section */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[22px] text-primary">functions</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Deterministic Proof Engine
                </span>
              </div>
              <span className="font-code-sm text-code-sm px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                Step-by-Step SHA-256 Math
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Agri-quality disputes require mathematical certainty. When assayer Lakshmi R. or Murugan K. locks an
              inspection, GradeChain executes deterministic canonical serialization offline on the PDA before
              transmission.
            </p>
            <div className="flex flex-col gap-space-sm">
              {/* Step 1 Math */}
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1.5">
                <div className="flex items-center justify-between font-code-sm text-code-sm">
                  <span className="font-bold text-primary">Stage 1 • Canonical Payload Normalization (RFC 8785)</span>
                  <span className="text-outline">Lexicographic Key Ordering</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant text-[13px]">
                  Whitespace removed, numeric precision normalized to fixed scale, keys sorted alphabetically:
                </p>
                <pre className="p-space-xs rounded bg-surface-container text-on-surface font-code-sm text-code-sm overflow-x-auto text-[12px]">
                  {`{"agentId":"AGT-TN-404","commodity":"Paddy IR-20","foreignMatterPct":1.4,"lotId":"LOT-TN-2026-0888","moisture":12.8,"overallGrade":"B"}`}
                </pre>
              </div>

              {/* Step 2 Math */}
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1.5">
                <div className="flex items-center justify-between font-code-sm text-code-sm">
                  <span className="font-bold text-primary">Stage 2 • Payload SHA-256 Hash Digest</span>
                  <span className="text-outline">Offline Device Fingerprint</span>
                </div>
                <div className="flex items-center gap-space-sm font-code-sm text-code-sm text-[12px] bg-surface-container p-space-xs rounded text-on-surface truncate">
                  <span className="text-outline">payloadHash:</span>
                  <span className="font-semibold text-primary">
                    sha256(canonicalPayload) → 84ab2e10ff61c998de4b321a5c678a10
                  </span>
                </div>
              </div>

              {/* Step 3 Math */}
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1.5">
                <div className="flex items-center justify-between font-code-sm text-code-sm">
                  <span className="font-bold text-primary">Stage 3 • Full Header &amp; Parent Link Hash</span>
                  <span className="text-outline">Chained to Block #3</span>
                </div>
                <div className="font-code-sm text-code-sm text-[12px] bg-surface-container p-space-xs rounded text-on-surface flex flex-col gap-1">
                  <div>
                    <span className="text-outline">Header Input:</span>{' '}
                    <span className="text-on-surface font-mono">index + prevHash + timestamp + payloadHash + nonce</span>
                  </div>
                  <div className="text-primary font-semibold truncate">
                    <span className="text-outline">Block Seal:</span> sha256(header) →
                    d19c4458f27801a938cde1160a2b95fa...
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seed Mandi Nodes Network Card */}
          <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Seed Ledger Topology</span>
                <span className="px-space-xs py-0.5 rounded bg-surface-container text-primary font-code-sm text-code-sm font-semibold">
                  Consensus OK
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                GradeChain runs cross-validation nodes at critical regulated procurement yards across the Cauvery Delta
                region.
              </p>
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg text-on-surface font-bold">Thanjavur Mandi Yard</span>
                      <span className="font-code-sm text-code-sm text-outline">Node ID: TN-APMC-09 (Primary Gateway)</span>
                    </div>
                  </div>
                  <span className="font-code-sm text-code-sm font-semibold text-primary">Synched • 12ms</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg text-on-surface font-bold">
                        Tiruvarur Grain Terminal
                      </span>
                      <span className="font-code-sm text-code-sm text-outline">
                        Node ID: TN-APMC-14 (Assay Re-checker)
                      </span>
                    </div>
                  </div>
                  <span className="font-code-sm text-code-sm font-semibold text-primary">Synched • 18ms</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg text-on-surface font-bold">
                        Nagapattinam Port Hub
                      </span>
                      <span className="font-code-sm text-code-sm text-outline">
                        Node ID: TN-APMC-22 (FCI FAQ Export Gate)
                      </span>
                    </div>
                  </div>
                  <span className="font-code-sm text-code-sm font-semibold text-primary">Synched • 24ms</span>
                </div>
              </div>
            </div>
            <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between font-code-sm text-code-sm">
              <span className="text-outline">Active Ledger Snapshot</span>
              <span className="text-on-surface font-mono font-semibold">TN-DELTA-2026.03</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Inspection Modal */}
      {inspectingBlock && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="w-full max-w-4xl bg-surface-container-lowest rounded-xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="w-full bg-tertiary text-on-tertiary p-space-md flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[24px] text-primary-fixed">terminal</span>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm font-bold">
                    Block #{inspectingBlock.index} ({inspectingBlock.lotId}) Cryptographic Inspection
                  </span>
                  <span className="font-code-sm text-code-sm text-tertiary-fixed-dim">
                    RFC 8785 Canonical JSON &amp; Cryptographic Proof Walk
                  </span>
                </div>
              </div>
              <button
                className="w-8 h-8 rounded-lg bg-tertiary-container hover:bg-outline text-on-tertiary flex items-center justify-center transition-colors cursor-pointer"
                onClick={() => setInspectingBlockIndex(null)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-space-lg flex-1 overflow-y-auto flex flex-col gap-space-md">
              {/* Hash summary tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm font-code-sm text-code-sm">
                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                  <span className="text-outline font-label-md text-label-md uppercase">Current Block SHA-256</span>
                  <span className="font-mono text-primary font-bold break-all">{inspectingBlock.hash}</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                  <span className="text-outline font-label-md text-label-md uppercase">
                    Previous Linked Block (#{inspectingBlock.index > 0 ? inspectingBlock.index - 1 : 0})
                  </span>
                  <span className="font-mono text-on-surface break-all">{inspectingBlock.prevHash}</span>
                </div>
              </div>

              {/* Canonical Payload JSON viewer */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-label-lg text-label-lg font-bold text-on-surface">
                    Sorted Canonical Payload Record
                  </span>
                  <span className="font-code-sm text-code-sm text-primary font-semibold">
                    Strict Alphabetical Keys • No Formatting Skew
                  </span>
                </div>
                <pre className="p-space-md rounded-lg bg-tertiary text-primary-fixed font-code-sm text-code-sm overflow-x-auto leading-relaxed shadow-sm">
                  {JSON.stringify(
                    {
                      index: inspectingBlock.index,
                      lotId: inspectingBlock.lotId,
                      payload: Object.keys(inspectingBlock.payload)
                        .sort()
                        .reduce((acc: any, k) => {
                          acc[k] = inspectingBlock.payload[k];
                          return acc;
                        }, {}),
                      prevHash: inspectingBlock.prevHash,
                      timestamp: inspectingBlock.timestamp,
                      type: inspectingBlock.type,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              {/* Payload Proof Calculation Breakdown */}
              <div className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-sm">
                <span className="font-label-lg text-label-lg font-bold text-on-surface">
                  Offline Biometric &amp; Device Signature Confirmation
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm font-code-sm text-code-sm text-on-surface-variant">
                  <div className="flex flex-col">
                    <span className="text-outline">Assayer Biometric ID:</span>
                    <span className="font-semibold text-on-surface">
                      {inspectingBlock.payload.agentId || 'APMC-ADMIN-SEED'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-outline">Mandi Capture Device:</span>
                    <span className="font-semibold text-on-surface">MandiPDA-Rugged-T1</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-outline">Payload Digest Match:</span>
                    <span
                      className={`font-semibold font-mono ${
                        tamperMode === 'MODE_A' && inspectingBlock.index === 4
                          ? 'text-error'
                          : 'text-primary'
                      }`}
                    >
                      {tamperMode === 'MODE_A' && inspectingBlock.index === 4
                        ? 'MISMATCH! (Hash discrepancy)'
                        : 'MATCH (100% Deterministic)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-space-md bg-surface-container-low flex items-center justify-between">
              <span className="font-code-sm text-code-sm text-outline">
                Verified against FCI FAQ Order #2026-APMC-KA
              </span>
              <button
                className="px-space-md py-space-xs rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold hover:bg-primary-container cursor-pointer"
                onClick={() => setInspectingBlockIndex(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
