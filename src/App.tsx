/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ScreenId, UserRole, LotRecord, ChainBlock } from './types';
import { INITIAL_CHAIN_BLOCKS, INITIAL_RECENT_LOTS, INITIAL_ASSAYERS } from './data/seedData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CaptureGradeScreen } from './screens/CaptureGradeScreen';
import { BuyerRecheckScreen } from './screens/BuyerRecheckScreen';
import { LedgerCryptographyScreen } from './screens/LedgerCryptographyScreen';
import { AgentReputationScreen } from './screens/AgentReputationScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('capture-grade');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [role, setRole] = useState<UserRole>('agent');
  const [recentLots, setRecentLots] = useState<LotRecord[]>(INITIAL_RECENT_LOTS);
  const [chainBlocks, setChainBlocks] = useState<ChainBlock[]>(INITIAL_CHAIN_BLOCKS);
  const [assayers, setAssayers] = useState(INITIAL_ASSAYERS);
  const [pendingSync, setPendingSync] = useState<number>(0);
  const [openDisputes, setOpenDisputes] = useState<number>(2);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'agent') {
      setCurrentScreen('capture-grade');
    } else if (newRole === 'buyer') {
      setCurrentScreen('buyer-recheck');
    } else if (newRole === 'auditor') {
      setCurrentScreen('ledger-and-cryptography');
    }
  };

  const handleLockGrade = (newLot: LotRecord) => {
    setRecentLots((prev) => [newLot, ...prev]);

    // Create a new block appended to chain
    const lastBlock = chainBlocks[chainBlocks.length - 1];
    const newBlock: ChainBlock = {
      index: lastBlock ? lastBlock.index + 1 : 7,
      type: 'GRADE_LOCKED',
      lotId: newLot.id,
      prevHash: lastBlock ? lastBlock.hash : '01f9a244ecbe76985a3a44d17332fa1f782390bb9934e622b7a974bfa029281a',
      hash:
        '0x' +
        Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      timestamp: new Date().toISOString(),
      payload: {
        agentId: newLot.agentId,
        agentName: newLot.agentName,
        commodity: newLot.commodity,
        lotId: newLot.id,
        moisture: 11.5,
        overallGrade: newLot.grade,
      },
    };

    setChainBlocks((prev) => [...prev, newBlock]);
  };

  const handleResolveDispute = (type: 'upheld' | 'buyer') => {
    setOpenDisputes((prev) => Math.max(0, prev - 1));

    // Update assayer reputation for S. Anbarasan / Murugan K.
    if (type === 'buyer') {
      setAssayers((prev) =>
        prev.map((a) => (a.id === 'murugan' ? { ...a, rating: 3.0, accuracy: '66% ACCURACY' } : a))
      );
    }

    // Append resolution block to chain
    const lastBlock = chainBlocks[chainBlocks.length - 1];
    const newBlock: ChainBlock = {
      index: lastBlock ? lastBlock.index + 1 : 8,
      type: 'DISPUTE_RESOLVED',
      lotId: 'LOT-TN-2026-0888',
      prevHash: lastBlock ? lastBlock.hash : '7a8f11099238ebaa6412e0941584c2098bb247183056ff9981240aa00ef5821c',
      hash:
        '0x' +
        Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      timestamp: new Date().toISOString(),
      payload: {
        arbitrator: 'APMC Chief Assayer Tribunal',
        disputeId: 'DSP-2026-0888',
        lotId: 'LOT-TN-2026-0888',
        outcome: type === 'upheld' ? 'AGENT_UPHELD' : 'DISPUTE_RESOLVED_OVERRULED',
        penaltyAssessed: type === 'upheld' ? 'NONE' : '15_TRUST_UNITS',
      },
    };

    setChainBlocks((prev) => [...prev, newBlock]);
  };

  return (
    <div className="bg-background font-body-md text-body-md text-on-background min-h-screen flex flex-col">
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        isOnline={isOnline}
        onToggleOnline={setIsOnline}
        role={role}
        onRoleChange={handleRoleChange}
        totalBlocks={chainBlocks.length + 7}
        openDisputes={openDisputes}
        pendingSync={pendingSync}
      />

      <main className="w-full pt-44 bg-background flex-1">
        {currentScreen === 'capture-grade' && (
          <CaptureGradeScreen
            onNavigate={setCurrentScreen}
            recentLots={recentLots}
            onLockGrade={handleLockGrade}
            pendingSync={pendingSync}
            onIncrementPendingSync={() => setPendingSync((p) => p + 1)}
          />
        )}

        {currentScreen === 'buyer-recheck' && (
          <BuyerRecheckScreen
            onNavigate={setCurrentScreen}
            openDisputes={openDisputes}
            onResolveDispute={handleResolveDispute}
          />
        )}

        {currentScreen === 'ledger-and-cryptography' && (
          <LedgerCryptographyScreen
            onNavigate={setCurrentScreen}
            chainBlocks={chainBlocks}
          />
        )}

        {currentScreen === 'agent-reputation' && (
          <AgentReputationScreen
            onNavigate={setCurrentScreen}
            assayers={assayers}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
