'use client';
import { useState } from 'react';
import { getSeedData, getBrandMentions } from '@/lib/data';

export default function BrandsPage() {
  const data = getSeedData();
  const mentions = getBrandMentions(data);
  const [period, setPeriod] = useState('7d');

  const totalCompetitor = mentions.competitors.reduce((s, m) => s + m.count, 0);
  const totalOwn = mentions.own.reduce((s, m) => s + m.count, 0);
  const maxComp = Math.max(...mentions.competitors.map(m => m.count), 1);
  const maxOwn = Math.max(...mentions.own.map(m => m.count), 1);

  const ts = new Date(data.timestamp);
  const synced = ts.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
    ' at ' + ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';

  return (
    <>
      <div className="mb-10">
        <h1 className="font-display text-5xl font-medium tracking-tight" style={{ letterSpacing: '-0.02em' }}>
          Brand Health
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft mt-2">
          Last synced: {synced}
        </p>
      </div>

      {/* Period + summary */}
      <div className="flex items-center justify-between mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft">
          Brand Health &middot; <span className="text-accent">{mentions.competitors.length}</span> competitors tracked &middot; <span className="text-accent">{mentions.own.length}</span> GCPL brands mentioned
        </p>
        <div className="flex gap-[1px] bg-rule">
          {['7d', '14d', '30d'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`font-mono text-[9px] uppercase tracking-[0.06em] px-3 py-1.5 transition-colors ${
                period === p ? 'bg-ink text-paper' : 'bg-paper text-ink-soft hover:bg-paper-deep'
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-[1px] bg-rule mb-10">
        <div className="bg-paper-deep p-6 text-center">
          <p className="font-display text-5xl italic text-accent" style={{ fontVariationSettings: '"opsz" 120' }}>
            {totalCompetitor}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft mt-1">Competitor Mentions</p>
        </div>
        <div className="bg-paper p-6 text-center border-l border-rule">
          <p className="font-display text-5xl italic text-accent-deep" style={{ fontVariationSettings: '"opsz" 120' }}>
            {totalOwn}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft mt-1">GCPL Brand Mentions</p>
        </div>
      </div>

      {/* Two-column leaderboards */}
      <div className="grid grid-cols-2 gap-10">
        {/* Competitor Watch */}
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft mb-4 pb-2 border-b-2 border-ink flex items-center gap-2">
            &#x2694; Competitor Watch
          </h2>
          <div className="space-y-0">
            {mentions.competitors.slice(0, 8).map((m, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-rule">
                <span className="font-display italic text-2xl w-8 text-center text-ink-soft" style={{ fontVariationSettings: '"opsz" 60' }}>
                  {m.count}
                </span>
                <span className="text-[13px] font-medium flex-1">{m.name}</span>
                <div className="w-24 h-[3px] bg-paper-deep rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full transition-all duration-700"
                    style={{ width: `${(m.count / maxComp) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GCPL Brand Voice */}
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft mb-4 pb-2 border-b-2 border-ink flex items-center gap-2">
            &#x1F3F7; GCPL Brand Voice
          </h2>
          <div className="space-y-0">
            {mentions.own.slice(0, 8).map((m, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-rule">
                <span className="font-display italic text-2xl w-8 text-center text-accent" style={{ fontVariationSettings: '"opsz" 60' }}>
                  {m.count}
                </span>
                <span className="text-[13px] font-medium flex-1">{m.name}</span>
                <div className="w-24 h-[3px] bg-paper-deep rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all duration-700"
                    style={{ width: `${(m.count / maxOwn) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
