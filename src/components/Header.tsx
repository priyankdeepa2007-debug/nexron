import React from 'react';
import { ScreenId, UserRole } from '../types';

interface HeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  isOnline: boolean;
  onToggleOnline: (status: boolean) => void;
  role: UserRole;
  onRoleChange: (newRole: UserRole) => void;
  totalBlocks: number;
  openDisputes: number;
  pendingSync: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  isOnline,
  onToggleOnline,
  role,
  onRoleChange,
  totalBlocks,
  openDisputes,
  pendingSync,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Top Telemetry Environment Bar */}
      <div className="w-full bg-tertiary text-on-tertiary px-gutter-desktop py-space-xs flex items-center justify-between font-code-sm text-code-sm uppercase tracking-wider">
        <div className="flex items-center gap-space-sm">
          <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
          <span>PROTOTYPE DEMO ENVIRONMENT • Seed Data Loaded (Thanjavur, Tiruvarur, Nagapattinam Mandis)</span>
        </div>
        <div className="flex items-center gap-space-lg text-tertiary-fixed-dim">
          <span>Team Nexora</span>
          <span>IEEE WIE ILS 2026</span>
        </div>
      </div>

      {/* Main Branding & Control Toolbar */}
      <div className="h-20 w-full px-gutter-desktop flex items-center justify-between">
        <div className="flex items-center gap-space-md cursor-pointer" onClick={() => onNavigate('capture-grade')}>
          <img
            alt="GradeChain Logo"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1VsXZE_rURml0zl0EpcRjrK6AzO-jt9lrCHfm4iZ3LzZstQqr32CdT9_GGolRF9zfPVVlqJSWN5WwNzNTO5BJAbe1YSpA_2mZ3KZc7tn63hDyH3dTZQq8AG8jOhpI67G6Evm47yfSxGhiybp2HVQlDN-H6NwAUXIKYz8_yQyZMvcTKtNI4YDbEF7zfb6zfic_VnYy1K4HXAwQJ2iabo-2b62jA6_ZZx4okNYI-Pq7tssngrIa8s9_tvSh8g"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-space-sm">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">GradeChain</span>
              <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-code-sm text-code-sm uppercase font-semibold">
                Mandi QA v1.0 • IEEE WIE ILS 2026
              </span>
            </div>
            <span className="font-label-md text-label-md text-outline tracking-wider uppercase">
              Tamper-Evident Agri QA • Canonical Ledger
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-md">
          {/* Simulator Toggle */}
          <div className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1.5 rounded-lg">
            <span className="font-label-md text-label-md text-outline mr-1">SIMULATOR:</span>
            <button
              onClick={() => onToggleOnline(true)}
              className={`flex items-center gap-1.5 px-space-xs py-1 rounded font-code-sm text-code-sm font-semibold transition-all ${
                isOnline
                  ? 'bg-surface-container-lowest text-primary shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-outline hover:text-on-surface'
              }`}
              type="button"
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-primary' : 'bg-outline'}`}></span>
              <span>Online</span>
            </button>
            <button
              onClick={() => onToggleOnline(false)}
              className={`flex items-center gap-1.5 px-space-xs py-1 rounded font-code-sm text-code-sm font-semibold transition-all ${
                !isOnline
                  ? 'bg-surface-container-lowest text-secondary shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-outline hover:text-on-surface'
              }`}
              type="button"
            >
              <span className={`w-2 h-2 rounded-full ${!isOnline ? 'bg-secondary' : 'bg-outline'}`}></span>
              <span>Offline</span>
            </button>
          </div>

          {/* Role Dropdown */}
          <div className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1.5 rounded-lg">
            <span className="font-label-md text-label-md text-outline mr-1">ROLE:</span>
            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent font-label-lg text-label-lg text-on-surface font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="agent">Agent (Lot Ingest)</option>
              <option value="buyer">Buyer (Re-check)</option>
              <option value="auditor">Auditor (Cryptographic QA)</option>
            </select>
          </div>

          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>

      {/* Network Metrics Bar */}
      <div className="w-full bg-surface-container-low px-gutter-desktop py-1 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-space-lg font-code-sm text-code-sm">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-primary' : 'bg-secondary'}`}></span>
            <span className="text-outline">Ledger Integrity:</span>
            <span className={`font-semibold uppercase ${isOnline ? 'text-primary' : 'text-secondary'}`}>
              {isOnline ? 'Verified' : 'Cached Local'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-outline">Blocks:</span>
            <span className="font-semibold text-on-surface">{totalBlocks}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-outline">System Confirmation:</span>
            <span className="font-semibold text-primary">88.9%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-outline">Open Disputes:</span>
            <span className="font-semibold text-secondary-container">{openDisputes}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-outline">Pending Sync:</span>
            <span className="font-semibold text-outline">{pendingSync}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 font-code-sm text-code-sm text-outline">
          <span>Network Node:</span>
          <span className="font-mono text-on-surface">TN-APMC-09</span>
        </div>
      </div>

      {/* Navigation Links with exact data-path required by the Prototype Navigation Spec */}
      <nav
        className="w-full px-gutter-desktop bg-surface-container-lowest flex items-center gap-space-sm"
        data-active-classes="bg-primary-container text-on-primary rounded-lg font-semibold shadow-sm"
      >
        <a
          data-path="capture-grade"
          href="#capture-grade"
          aria-current={currentScreen === 'capture-grade' ? 'page' : undefined}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('capture-grade');
          }}
          className={
            currentScreen === 'capture-grade'
              ? 'px-space-md py-space-sm transition-colors bg-primary-container text-on-primary rounded-lg font-semibold shadow-sm'
              : 'px-space-md py-space-sm font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors'
          }
        >
          Capture Grade
        </a>

        <a
          data-path="buyer-recheck"
          href="#buyer-recheck"
          aria-current={currentScreen === 'buyer-recheck' ? 'page' : undefined}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('buyer-recheck');
          }}
          className={
            currentScreen === 'buyer-recheck'
              ? 'px-space-md py-space-sm transition-colors bg-primary-container text-on-primary rounded-lg font-semibold shadow-sm'
              : 'px-space-md py-space-sm font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors'
          }
        >
          Buyer Re-check
        </a>

        <a
          data-path="ledger-and-cryptography"
          href="#ledger-and-cryptography"
          aria-current={currentScreen === 'ledger-and-cryptography' ? 'page' : undefined}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('ledger-and-cryptography');
          }}
          className={
            currentScreen === 'ledger-and-cryptography'
              ? 'px-space-md py-space-sm transition-colors bg-primary-container text-on-primary rounded-lg font-semibold shadow-sm'
              : 'px-space-md py-space-sm font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors'
          }
        >
          Ledger &amp; Cryptography
        </a>

        <a
          data-path="agent-reputation"
          href="#agent-reputation"
          aria-current={currentScreen === 'agent-reputation' ? 'page' : undefined}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('agent-reputation');
          }}
          className={
            currentScreen === 'agent-reputation'
              ? 'px-space-md py-space-sm transition-colors bg-primary-container text-on-primary rounded-lg font-semibold shadow-sm'
              : 'px-space-md py-space-sm font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors'
          }
        >
          Agent Reputation
        </a>
      </nav>
    </header>
  );
};
