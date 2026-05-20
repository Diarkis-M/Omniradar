'use client';
import { useState, useEffect } from 'react';
import { getSeedData, getUrgencyLevel, categorizeSignal, findSupportingSignals, getAllSignals, isBeautyRelated } from '@/lib/data';
import DetailDrawer from '@/components/DetailDrawer';

// Platform icon helper
const pIcon = (n) => {
  const k = n.toLowerCase();
  if (k.includes('amazon'))    return '\u{1F4E6}';
  if (k.includes('flipkart'))  return '\u{1F6D2}';
  if (k.includes('nykaa'))     return '\u{1F48E}';
  if (k.includes('reddit'))    return '\u{1F4AC}';
  if (k.includes('instagram')) return '\u{1F4F8}';
  if (k.includes('news'))      return '\u{1F4F0}';
  if (k.includes('pinterest')) return '\u{1F4CC}';
  if (k.includes('google'))    return '\u{1F50D}';
  if (k.includes('social') || k.includes('twitter')) return '\u{1F426}';
  return '\u{1F4CA}';
};

export default function DigestPage() {
  const data = getSeedData();
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Pre-compute evidence for each trend
  const trendsWithEvidence = data.trends.map(t => ({
    ...t,
    category: categorizeSignal(t),
    urgency: getUrgencyLevel(t),
    evidence: findSupportingSignals(t, data),
  }));

  const ts = new Date(data.timestamp);
  const synced = ts.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
    ' at ' + ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';

  const totalSignals = getAllSignals(data).filter(isBeautyRelated).length;

  return (
    <>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display font-medium tracking-tight" style={{ letterSpacing: '-0.02em', fontSize: 'clamp(1.75rem, 5vw, 3rem)' }}>
          Intelligence Digest
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft mt-2">
          {data.trends.length} trends identified from {totalSignals} signals &middot; Last synced: {synced}
        </p>
      </div>

      {/* ══════════ TREND SNAPSHOT — executive summary table ══════════ */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: '2px solid var(--ink)' }}>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.15em]" style={{ color: 'var(--accent-deep)' }}>
            Trend Snapshot
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: 'var(--ink-faint)' }}>
            Cross-platform detection summary
          </span>
        </div>

        {/* Summary table — responsive: card list on mobile, grid table on desktop */}
        <div style={{ border: '1px solid var(--rule)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {!isMobile && (
            /* Desktop: grid table header */
            <div className="grid" style={{
              gridTemplateColumns: '1fr 100px 180px 80px',
              background: 'var(--ink)', color: 'var(--paper)', padding: '8px 16px',
              fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
              letterSpacing: '0.08em', fontWeight: 500,
            }}>
              <span>Trend</span>
              <span>Urgency</span>
              <span>Platforms Detected</span>
              <span className="text-right">Signals</span>
            </div>
          )}

          {/* Rows */}
          {trendsWithEvidence.map((t, i) => (
            isMobile ? (
              /* Mobile: stacked card row */
              <div key={i}
                className="cursor-pointer transition-colors"
                style={{
                  padding: '12px 14px',
                  background: 'var(--paper)',
                  borderTop: i > 0 ? '1px solid var(--rule)' : 'none',
                }}
                onClick={() => setSelected(t)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-display font-medium" style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.3 }}>
                    {t.trend_name}
                  </span>
                  <span className={`font-mono text-[9px] uppercase tracking-[0.06em] px-2 py-[2px] rounded-editorial shrink-0 ${
                    t.urgency === 'URGENT' ? 'bg-red-50 text-red-700 border border-red-200' :
                    t.urgency === 'MONITOR' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {t.urgency}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {t.evidence && Object.keys(t.evidence.platforms).map((p, j) => (
                      <span key={j} style={{ fontSize: '12px' }}>{pIcon(p)}</span>
                    ))}
                    <span className="font-mono ml-1" style={{ fontSize: '10px', color: 'var(--accent-deep)', fontWeight: 600 }}>
                      {t.evidence ? t.evidence.platformCount : 0} platforms
                    </span>
                  </div>
                  <span className="font-mono" style={{ fontSize: '10px', color: 'var(--ink-faint)' }}>
                    {t.evidence ? t.evidence.total : 0} signals
                  </span>
                </div>
              </div>
            ) : (
              /* Desktop: grid table row */
              <div key={i}
                className="grid cursor-pointer transition-colors"
                style={{
                  gridTemplateColumns: '1fr 100px 180px 80px',
                  padding: '10px 16px', alignItems: 'center',
                  background: 'var(--paper)',
                  borderTop: '1px solid var(--rule)',
                }}
                onClick={() => setSelected(t)}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--paper-deep)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--paper)')}
              >
                <div>
                  <span className="font-display font-medium" style={{ fontSize: '14px', color: 'var(--ink)' }}>
                    {t.trend_name}
                  </span>
                  <span className="font-mono uppercase ml-2" style={{
                    fontSize: '9px', color: 'var(--ink-faint)', letterSpacing: '0.06em',
                  }}>
                    {t.category}
                  </span>
                </div>
                <span className={`font-mono text-[9px] uppercase tracking-[0.06em] px-2 py-[2px] rounded-editorial inline-block text-center ${
                  t.urgency === 'URGENT' ? 'bg-red-50 text-red-700 border border-red-200' :
                  t.urgency === 'MONITOR' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {t.urgency}
                </span>
                <div className="flex items-center gap-1">
                  {t.evidence && Object.keys(t.evidence.platforms).map((p, j) => (
                    <span key={j} title={`${p}: ${t.evidence.platforms[p].count} signals`}
                      style={{ fontSize: '12px', cursor: 'default' }}>
                      {pIcon(p)}
                    </span>
                  ))}
                  <span className="font-mono ml-1" style={{ fontSize: '10px', color: 'var(--accent-deep)', fontWeight: 600 }}>
                    {t.evidence ? t.evidence.platformCount : 0}
                  </span>
                </div>
                <span className="font-mono text-right" style={{ fontSize: '12px', color: 'var(--ink)', fontWeight: 600 }}>
                  {t.evidence ? t.evidence.total : 0}
                </span>
              </div>
            )
          ))}
        </div>
      </div>

      {/* ══════════ INDIVIDUAL TREND DEEP DIVES ══════════ */}
      <div className="mb-4 pb-2" style={{ borderBottom: '2px solid var(--ink)' }}>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.15em]" style={{ color: 'var(--accent-deep)' }}>
          Detailed Analysis
        </h2>
      </div>

      {trendsWithEvidence.map((trend, i) => {
        const ev = trend.evidence;
        return (
          <div key={i}
            className="mb-6 cursor-pointer transition-colors"
            style={{
              background: 'var(--paper)', borderRadius: 'var(--radius)',
              border: '1px solid var(--rule)', overflow: 'hidden',
            }}
            onClick={() => setSelected(trend)}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--rule)')}
          >
            {/* Card header */}
            <div style={{ padding: isMobile ? '14px 14px 12px' : '20px 20px 16px', borderBottom: '1px solid var(--rule)' }}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="font-mono text-[9px] uppercase tracking-[0.06em] px-2 py-[2px] bg-ink text-paper rounded-editorial">
                      {trend.label?.replace(/[\[\]]/g, '') || 'SIGNAL'}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.06em] px-2 py-[2px] border border-rule rounded-editorial text-ink-soft">
                      {trend.category}
                    </span>
                    <span className={`font-mono text-[9px] uppercase tracking-[0.06em] px-2 py-[2px] rounded-editorial ${
                      trend.urgency === 'URGENT' ? 'bg-red-50 text-red-700 border border-red-200' :
                      trend.urgency === 'MONITOR' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {trend.urgency}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-medium mb-1" style={{ fontSize: isMobile ? '18px' : '24px', letterSpacing: '-0.01em', color: 'var(--ink)' }}>
                    {trend.trend_name}
                  </h3>

                  {/* Source */}
                  <p className="font-mono text-[9px] uppercase tracking-[0.06em]" style={{ color: 'var(--ink-soft)', wordBreak: 'break-word' }}>
                    {trend.source_platform} &nbsp;&middot;&nbsp; {trend.metric}
                  </p>
                </div>

                {/* Platform count badge — hidden on mobile */}
                {ev && !isMobile && (
                  <div className="flex flex-col items-center ml-4 px-4 py-2" style={{
                    background: 'var(--paper-deep)', borderRadius: 'var(--radius)',
                    border: '1px solid var(--rule)', minWidth: 72,
                  }}>
                    <span className="font-display font-bold" style={{ fontSize: 28, color: 'var(--accent-deep)', lineHeight: 1 }}>
                      {ev.platformCount}
                    </span>
                    <span className="font-mono uppercase" style={{ fontSize: '8px', color: 'var(--ink-faint)', letterSpacing: '0.08em' }}>
                      platforms
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Two-column body: Context + Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left: Context + Insight */}
              <div style={{ padding: isMobile ? '14px' : '20px', borderRight: isMobile ? 'none' : '1px solid var(--rule)', borderBottom: isMobile ? '1px solid var(--rule)' : 'none' }}>
                {trend.context && (
                  <div className="mb-4">
                    <div className="font-mono uppercase mb-1" style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>
                      Context
                    </div>
                    <p className="font-body text-[13px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                      {trend.context}
                    </p>
                  </div>
                )}
                {trend.result && (
                  <div>
                    <div className="font-mono uppercase mb-1" style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>
                      GCPL Insight
                    </div>
                    <div style={{ borderLeft: '2px solid var(--accent)', paddingLeft: 10 }}>
                      <p className="font-body text-[13px] leading-relaxed" style={{ color: 'var(--ink)' }}>
                        {trend.result}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Cross-platform evidence */}
              <div style={{ padding: isMobile ? '14px' : '20px' }}>
                <div className="font-mono uppercase mb-2" style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>
                  Why This Is Trending
                </div>

                {ev ? (
                  <>
                    <div className="font-mono mb-3" style={{ fontSize: '11px', color: 'var(--accent-deep)', fontWeight: 600 }}>
                      {ev.platformCount >= 3
                        ? `Cross-platform convergence across ${ev.platformCount} sources`
                        : ev.platformCount === 2
                        ? `Multi-platform signal on ${ev.platformCount} sources`
                        : `${ev.total} supporting signals detected`}
                    </div>

                    {/* Platform evidence rows */}
                    <div style={{ borderTop: '1px solid var(--rule)' }}>
                      {Object.entries(ev.platforms).map(([platName, info]) => (
                        <div key={platName} className="flex items-center justify-between py-2"
                          style={{ borderBottom: '1px solid var(--rule)' }}>
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: '13px' }}>{pIcon(platName)}</span>
                            <span className="font-mono uppercase" style={{ fontSize: '10px', fontWeight: 500, color: 'var(--ink)', letterSpacing: '0.04em' }}>
                              {platName}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {info.avgRating && (
                              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>
                                &#9733;{info.avgRating}
                              </span>
                            )}
                            {info.totalReviews > 0 && (
                              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>
                                {(info.totalReviews / 1000).toFixed(0)}K rev
                              </span>
                            )}
                            {info.totalUpvotes > 0 && (
                              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>
                                &#9650;{info.totalUpvotes}
                              </span>
                            )}
                            {info.avgVelocity && (
                              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-deep)', fontWeight: 600 }}>
                                &#9889;{info.avgVelocity}
                              </span>
                            )}
                            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--ink-faint)' }}>
                              {info.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Keywords */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {ev.keywords.map((kw, j) => (
                        <span key={j} className="font-mono" style={{
                          fontSize: '8px', color: 'var(--ink-faint)',
                          border: '1px solid var(--rule)', borderRadius: 3,
                          padding: '1px 4px',
                        }}>
                          {kw}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="font-mono text-[10px]" style={{ color: 'var(--ink-faint)' }}>
                    No cross-platform evidence found
                  </p>
                )}
              </div>
            </div>

            {/* Card footer */}
            <div className="flex items-center justify-between py-3" style={{ paddingLeft: isMobile ? 14 : 20, paddingRight: isMobile ? 14 : 20, borderTop: '1px solid var(--rule)', background: 'var(--paper-deep)' }}>
              <button className="font-mono text-[10px] uppercase tracking-[0.06em] cursor-pointer bg-transparent border-none"
                style={{ color: 'var(--accent-deep)', padding: 0 }}
                onClick={(e) => { e.stopPropagation(); setSelected(trend); }}>
                View full details &rarr;
              </button>
              <div className="flex items-center gap-1">
                {ev && Object.keys(ev.platforms).map((p, j) => (
                  <span key={j} style={{ fontSize: '11px' }}>{pIcon(p)}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <DetailDrawer signal={selected} onClose={() => setSelected(null)} />
    </>
  );
}
