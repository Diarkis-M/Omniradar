'use client';
import { useState } from 'react';
import { getSeedData, getAllSignals, getBrandMentions, getUrgencyLevel, getCompetitorSignals, isBeautyRelated } from '@/lib/data';
import StatStrip from '@/components/StatStrip';
import SignalCard from '@/components/SignalCard';
import CompetitorPulse from '@/components/CompetitorPulse';
import DetailDrawer from '@/components/DetailDrawer';
import Link from 'next/link';

export default function Dashboard() {
  const data = getSeedData();
  const allSignals = getAllSignals(data).filter(isBeautyRelated);
  const mentions = getBrandMentions(data);
  const competitorSignals = getCompetitorSignals(data);
  const [selected, setSelected] = useState(null);

  const urgentCount = data.trends.filter(t => getUrgencyLevel(t) === 'URGENT').length;
  const newCount = data.trends.length;

  const ts = new Date(data.timestamp);
  const synced = ts.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
    ' at ' + ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-5xl font-medium tracking-tight" style={{ letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft mt-2">
          Last synced: {synced}
        </p>
      </div>

      {/* Stat Strip */}
      <StatStrip stats={[
        { label: 'Urgent Trends', value: urgentCount },
        { label: 'AI Signals', value: newCount },
        { label: 'Total Signals', value: allSignals.length },
        { label: 'Competitors Tracked', value: mentions.competitors.length },
      ]} />

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-[1px] bg-rule mt-8 mb-12">
        <Link href="/digest" className="bg-paper hover:bg-paper-deep transition-colors px-6 py-5 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em]">
          <span className="text-accent text-lg">&#10024;</span> View AI Digest
        </Link>
        <button className="bg-paper hover:bg-paper-deep transition-colors px-6 py-5 font-mono text-[10px] uppercase tracking-[0.08em]">
          &#x27F3; Sync Data
        </button>
      </div>

      {/* Today's Intelligence */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-ink">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
            Today&apos;s Intelligence
          </h2>
          <Link href="/digest" className="font-mono text-[10px] uppercase tracking-[0.08em] text-accent hover:text-accent-deep">
            View all {data.trends.length} &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-[1px] bg-rule">
          {data.trends.slice(0, 3).map((trend, i) => {
            const urgency = getUrgencyLevel(trend);
            return (
              <div key={i} className="bg-paper p-6 cursor-pointer hover:bg-paper-deep transition-colors" onClick={() => setSelected(trend)}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.08em] px-2 py-[2px] border border-rule rounded-editorial text-ink-soft">
                    {trend.label?.replace(/[\[\]]/g, '') || 'SIGNAL'}
                  </span>
                  <span className={`font-mono text-[9px] uppercase tracking-[0.08em] px-2 py-[2px] rounded-editorial ${
                    urgency === 'URGENT' ? 'bg-red-50 text-red-700 border border-red-200' :
                    urgency === 'MONITOR' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {urgency}
                  </span>
                </div>
                <h3 className="font-display text-xl font-medium mb-2" style={{ letterSpacing: '-0.01em' }}>
                  {trend.trend_name}
                </h3>
                <p className="text-ink-soft text-[13px] leading-relaxed line-clamp-3">
                  {trend.context}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Competitor Pulse */}
      <CompetitorPulse mentions={mentions.competitors} />

      {/* Last synced footer */}
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-center text-ink-soft mt-12 pt-6 border-t border-rule">
        Last synced: {synced}
      </p>

      {/* Detail Drawer */}
      <DetailDrawer
        signal={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
