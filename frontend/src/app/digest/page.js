'use client';
import { useState } from 'react';
import { getSeedData, getUrgencyLevel, categorizeSignal } from '@/lib/data';
import DetailDrawer from '@/components/DetailDrawer';
import Link from 'next/link';

export default function DigestPage() {
  const data = getSeedData();
  const [selected, setSelected] = useState(null);

  const grouped = {};
  data.trends.forEach(t => {
    const cat = categorizeSignal(t);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  });

  const ts = new Date(data.timestamp);
  const synced = ts.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
    ' at ' + ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';

  return (
    <>
      <div className="mb-10">
        <h1 className="font-display text-5xl font-medium tracking-tight" style={{ letterSpacing: '-0.02em' }}>
          Intelligence Digest
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft mt-2">
          {data.trends.length} signals &middot; Last synced: {synced}
        </p>
      </div>

      {Object.entries(grouped).map(([category, trends]) => (
        <div key={category} className="mb-12">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-ink">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-accent-deep flex items-center gap-2">
              <span className="text-lg">&#10024;</span> {category}
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft">
              {trends.length} trend{trends.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {trends.map((trend, i) => {
              const urgency = getUrgencyLevel(trend);
              return (
                <div key={i} className="bg-paper p-6 cursor-pointer hover:bg-paper-deep transition-colors border-b border-r"
                  style={{ borderColor: 'var(--rule)' }}
                  onClick={() => setSelected(trend)}>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.06em] px-2 py-[2px] bg-ink text-paper rounded-editorial">
                      {trend.label?.replace(/[\[\]]/g, '') || 'SIGNAL'}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.06em] px-2 py-[2px] border border-rule rounded-editorial text-ink-soft">
                      {category}
                    </span>
                    <span className={`font-mono text-[9px] uppercase tracking-[0.06em] px-2 py-[2px] rounded-editorial ${
                      urgency === 'URGENT' ? 'bg-red-50 text-red-700 border border-red-200' :
                      urgency === 'MONITOR' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {urgency}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-xl font-medium mb-2" style={{ letterSpacing: '-0.01em' }}>
                    {trend.trend_name}
                  </h3>

                  {/* Source */}
                  <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-ink-soft mb-3">
                    &#x1F4CD; {trend.source_platform} &nbsp;&nbsp; &#x1F4CA; {trend.metric}
                  </p>

                  {/* Context */}
                  <p className="text-ink-soft text-[13px] leading-relaxed mb-4 line-clamp-3">
                    {trend.context}
                  </p>

                  {/* GCPL Insight */}
                  <div className="border-l-2 border-accent bg-paper-deep p-3 mb-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-accent-deep mb-1">
                      &#10024; GCPL Insight
                    </p>
                    <p className="text-[13px] text-ink-soft leading-relaxed">
                      {trend.result}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button className="font-mono text-[9px] uppercase tracking-[0.06em] text-ink-soft hover:text-accent transition-colors">
                      &#x1F50D; View full details &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <DetailDrawer signal={selected} onClose={() => setSelected(null)} />
    </>
  );
}
