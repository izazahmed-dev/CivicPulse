'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type DemoRole = 'citizen' | 'operator' | 'verifier';

interface DemoRoleContextValue {
  role: DemoRole;
  setRole: (role: DemoRole) => void;
}

const DemoRoleContext = createContext<DemoRoleContextValue | null>(null);

export function DemoRoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<DemoRole>('citizen');

  useEffect(() => {
    const stored = window.localStorage.getItem('fieldbridge-role') as DemoRole | null;
    if (stored) setRoleState(stored);
  }, []);

  const value = useMemo(() => ({
    role,
    setRole: (nextRole: DemoRole) => {
      setRoleState(nextRole);
      window.localStorage.setItem('fieldbridge-role', nextRole);
    },
  }), [role]);

  return <DemoRoleContext.Provider value={value}>{children}</DemoRoleContext.Provider>;
}

export function useDemoRole() {
  const context = useContext(DemoRoleContext);
  if (!context) {
    throw new Error('useDemoRole must be used inside DemoRoleProvider');
  }
  return context;
}

export function DemoRoleSwitcher() {
  const { role, setRole } = useDemoRole();

  return (
    <div className="fb-panel-soft inline-flex rounded-full p-1">
      {(['citizen', 'operator', 'verifier'] as DemoRole[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setRole(option)}
          className={`rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-all ${
            option === role
              ? 'bg-white text-[#08121f]'
              : 'text-white/55 hover:text-white'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

