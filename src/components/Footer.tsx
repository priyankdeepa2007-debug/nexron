import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-low mt-space-xl py-space-lg">
      <div className="w-full px-gutter-desktop flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-space-sm font-code-sm text-code-sm text-on-surface font-semibold">
            <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
            <span>Canonical JSON SHA-256 Protocol • Tamper Verification Standard</span>
          </div>
          <p className="text-outline font-label-md text-label-md">
            Engineered for APMC Mandis, Farmers &amp; Procurement Assayers under FCI FAQ Compliance Guidelines.
          </p>
        </div>
        <div className="flex items-center gap-space-lg font-code-sm text-code-sm text-outline">
          <span>IEEE WIE ILS 2026</span>
          <span>•</span>
          <span>GradeChain v1.0 Core</span>
          <span>•</span>
          <span className="text-primary font-semibold">RFC 8785 Canonical Representation</span>
        </div>
      </div>
    </footer>
  );
};
