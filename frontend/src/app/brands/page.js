'use client';
import { useState } from 'react';
import { getSeedData, getBrandMentions, getBrandMentionDetails } from '@/lib/data';

// Category icons
const CAT_ICON = {
  "Men's Grooming": '\u{1FA92}',
  'Fragrances & EDP': '\u{1F9F4}',
  'Skincare': '✦',
  'Soaps & Body': '\u{1FAE7}',
  'Hair Care': '\u{1F487}',
  'Home Insecticides': '\u{1F6E1}',
  'Air Fresheners': '\u{1F33F}',
  'Sexual Wellness': '♡',
};

// Platform colours for the source badges
const PLAT_COLOR = {
  Amazon: '#FF9900',
  Flipkart: '#2874F0',
  Nykaa: '#FC2779',
  Reddit: '#FF4500',
  Instagram: '#C13584',
  Google: '#4285F4',
  'News / RSS': '#333',
  'Social / Twitter': '#1DA1F2',
  Pinterest: '#E60023',
};

// Compact brand source breakdown panel
function BrandDetail({ brandName, data }) {
  const details = getBrandMentionDetails(data, brandName);
  if (!details || details.total === 0) {
    return (
      <div className="px-4 py-3" style={{ background: 'var(--paper-deep)', borderTop: '1px solid var(--rule)' }}>
        <p className="font-mono text-[10px] text-ink-faint">
          No signals found. This brand may not appear in current scraped data titles.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--paper-deep)', borderTop: '1px solid var(--rule)' }}>
      {/* Platform summary chips */}
      <div className="flex flex-wrap gap-2 px-4 pt-3 pb-2">
        {details.platforms.map(({ platform, count }) => (
          <span key={platform} className="font-mono text-[10px] px-2 py-1 rounded-full"
            style={{
              background: PLAT_COLOR[platform] ? `${PLAT_COLOR[platform]}18` : 'var(--rule)',
              color: PLAT_COLOR[platform] || 'var(--ink-soft)',
              border: `1px solid ${PLAT_COLOR[platform] || 'var(--rule)'}40`,
            }}>
            {platform} ({count})
          </span>
        ))}
      </div>

      {/* Signal list — show top 5 per platform */}
      <div className="px-4 pb-3 flex flex-col gap-1">
        {details.platforms.map(({ platform, signals }) =>
          signals.slice(0, 3).map((s, i) => (
            <div key={`${platform}-${i}`} className="flex items-start gap-2 py-1"
              style={{ borderBottom: '1px solid var(--rule)' }}>
              <span className="font-mono text-[9px] uppercase shrink-0 mt-[2px] px-1 rounded"
                style={{
                  background: PLAT_COLOR[platform] ? `${PLAT_COLOR[platform]}15` : 'var(--rule)',
                  color: PLAT_COLOR[platform] || 'var(--ink-faint)',
                  minWidth: 50,
                  textAlign: 'center',
                }}>
                {platform.split(' ')[0]}
              </span>
              <div className="flex-1 min-w-0">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                    className="text-[12px] hover:underline block truncate"
                    style={{ color: 'var(--accent-deep)' }}>
                    {s.title.slice(0, 100) || 'View signal'}
                  </a>
                ) : (
                  <span className="text-[12px] block truncate" style={{ color: 'var(--ink)' }}>
                    {s.title.slice(0, 100)}
                  </span>
                )}
                {/* E-commerce meta */}
                {(s.price || s.rating > 0) && (
                  <span className="font-mono text-[9px] text-ink-faint">
                    {s.price && `${s.price} `}
                    {s.rating > 0 && `${s.rating}★ `}
                    {s.review_count > 0 && `${s.review_count.toLocaleString()} reviews`}
                  </span>
                )}
                {/* Reddit meta */}
                {s.score > 0 && (
                  <span className="font-mono text-[9px] text-ink-faint">
                    {s.score} upvotes {s.num_comments > 0 && `· ${s.num_comments} comments`}
                    {s.subreddit && ` · r/${s.subreddit}`}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function BrandsPage() {
  const data = getSeedData();
  const mentions = getBrandMentions(data);
  const [expandedBrand, setExpandedBrand] = useState(null);

  const totalCompetitor = mentions.competitors.reduce((s, m) => s + m.count, 0);
  const totalOwn = mentions.own.reduce((s, m) => s + m.count, 0);
  const maxOwn = Math.max(...mentions.own.map(m => m.count), 1);

  const ts = new Date(data.timestamp);
  const synced = ts.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
    ' at ' + ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';

  const activeCategories = Object.entries(mentions.competitorsByCategory)
    .map(([cat, brands]) => ({
      cat,
      brands: brands.sort((a, b) => b.count - a.count),
      total: brands.reduce((s, b) => s + b.count, 0),
    }))
    .sort((a, b) => b.total - a.total);

  const toggleBrand = (name) => {
    setExpandedBrand(prev => prev === name ? null : name);
  };

  return (
    <>
      <div className="mb-10">
        <h1 className="font-display text-5xl font-medium tracking-tight" style={{ letterSpacing: '-0.02em' }}>
          Brand Health
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft mt-2">
          GCPL competitive intelligence &middot; Last synced: {synced}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-[1px] bg-rule mb-10">
        <div className="bg-paper-deep p-6 text-center">
          <p className="font-display text-4xl italic text-accent" style={{ fontVariationSettings: '"opsz" 120' }}>
            {totalCompetitor}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft mt-1">Competitor Mentions</p>
        </div>
        <div className="bg-paper p-6 text-center">
          <p className="font-display text-4xl italic text-accent-deep" style={{ fontVariationSettings: '"opsz" 120' }}>
            {totalOwn}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft mt-1">GCPL Brand Mentions</p>
        </div>
        <div className="bg-paper-deep p-6 text-center">
          <p className="font-display text-4xl italic" style={{ fontVariationSettings: '"opsz" 120', color: 'var(--ink)' }}>
            {activeCategories.length}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft mt-1">Categories Tracked</p>
        </div>
      </div>

      {/* GCPL Brand Voice */}
      <div className="mb-12">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] mb-4 pb-2 border-b-2 border-ink flex items-center gap-2"
          style={{ color: 'var(--accent-deep)' }}>
          GCPL Brand Voice
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-[1px] bg-rule">
          {mentions.own
            .filter(m => m.count > 0)
            .sort((a, b) => b.count - a.count)
            .map((m, i) => {
              const isExpanded = expandedBrand === `own-${m.name}`;
              return (
                <div key={i} className="bg-paper" style={{ cursor: 'pointer' }}>
                  <div className="p-4 flex items-center justify-between"
                    onClick={() => toggleBrand(`own-${m.name}`)}>
                    <span className="text-[13px] font-medium flex items-center gap-1">
                      {m.name}
                      <span className="text-[9px]" style={{ color: 'var(--ink-faint)' }}>
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-[3px] bg-paper-deep rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${(m.count / maxOwn) * 100}%`, background: 'var(--accent)' }} />
                      </div>
                      <span className="font-display italic text-lg text-accent" style={{ fontVariationSettings: '"opsz" 60', minWidth: 24, textAlign: 'right' }}>
                        {m.count}
                      </span>
                    </div>
                  </div>
                  {isExpanded && <BrandDetail brandName={m.name} data={data} />}
                </div>
              );
            })}
          {mentions.own.filter(m => m.count > 0).length === 0 && (
            <div className="bg-paper p-4 col-span-3">
              <p className="font-mono text-[10px] text-ink-faint">No GCPL brand mentions found in current data</p>
            </div>
          )}
        </div>
      </div>

      {/* Competitor Watch by Category */}
      <div className="mb-4 pb-2 border-b-2 border-ink">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: 'var(--accent-deep)' }}>
          Competitor Watch — by Category
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {activeCategories.map(({ cat, brands, total }) => {
          const maxInCat = Math.max(...brands.map(b => b.count), 1);
          return (
            <div key={cat} style={{
              border: '1px solid var(--rule)', borderRadius: 'var(--radius)',
              overflow: 'hidden', background: 'var(--paper)',
            }}>
              {/* Category header */}
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--rule)', background: 'var(--paper-deep)' }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14 }}>{CAT_ICON[cat] || '\u{1F4CA}'}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] font-medium"
                    style={{ color: 'var(--ink)' }}>
                    {cat}
                  </span>
                </div>
                <span className="font-mono text-[10px]" style={{ color: 'var(--ink-faint)' }}>
                  {total} mention{total !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Brand rows — clickable */}
              <div className="px-4 py-2">
                {brands.map((m, j) => {
                  const isExpanded = expandedBrand === `${cat}-${m.name}`;
                  return (
                    <div key={j}>
                      <div className="flex items-center justify-between py-2"
                        style={{
                          borderBottom: (!isExpanded && j < brands.length - 1) ? '1px solid var(--rule)' : 'none',
                          cursor: m.count > 0 ? 'pointer' : 'default',
                        }}
                        onClick={() => m.count > 0 && toggleBrand(`${cat}-${m.name}`)}>
                        <span className="text-[13px] flex items-center gap-1"
                          style={{ color: m.count > 0 ? 'var(--ink)' : 'var(--ink-faint)' }}>
                          {m.name}
                          {m.count > 0 && (
                            <span className="text-[9px]" style={{ color: 'var(--ink-faint)' }}>
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-[3px] bg-paper-deep rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: m.count > 0 ? `${(m.count / maxInCat) * 100}%` : '0%',
                                background: 'var(--warning, #BD1362)',
                              }} />
                          </div>
                          <span className="font-display italic text-lg" style={{
                            fontVariationSettings: '"opsz" 60', minWidth: 24, textAlign: 'right',
                            color: m.count > 0 ? 'var(--ink)' : 'var(--ink-faint)',
                          }}>
                            {m.count}
                          </span>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="mb-2 rounded overflow-hidden" style={{ border: '1px solid var(--rule)' }}>
                          <BrandDetail brandName={m.name} data={data} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
