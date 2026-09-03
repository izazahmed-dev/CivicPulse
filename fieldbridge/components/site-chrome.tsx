import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Waves } from 'lucide-react';
import { DemoRoleSwitcher } from '@/components/demo-role';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="fb-shell fb-grid">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(7,17,31,0.88)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#6be7ff,#d4ff67)] text-[#08121f] shadow-[0_12px_30px_rgba(107,231,255,0.18)]">
              <Waves size={20} />
            </div>
            <div>
              <Link href="/" className="fb-heading text-xl font-black text-white">
                FieldBridge
              </Link>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Public Service Resolution Loop
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <Link href="/report" className="fb-chip">Report</Link>
            <Link href="/ops" className="fb-chip">Ops</Link>
            <Link href="/track/demo" className="fb-chip">Track Demo</Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-300 sm:flex">
              <ShieldCheck size={14} />
              Demo Ready
            </div>
            <DemoRoleSwitcher />
            <Link href="/report" className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#08121f] md:inline-flex">
              Launch Flow
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

