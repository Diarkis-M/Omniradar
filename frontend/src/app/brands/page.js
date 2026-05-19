'use client';
import { useState } from 'react';
import { getSeedData, getBrandMentions } from '@/lib/data';

// Category icons
const CAT_ICON = {
  "Men's Grooming": '🪒',
  'Fragrances & EDP': '🧴',
  'Skincare': '✦',
  'Soaps & Body': '🫧',
  'Hair Care': '💇',
  'Home Insecticides': '🛡',
  'Air Fresheners': '🌿',
  'Sexual Wellness': '♡',
};

export default function BrandsPage() {
  const data = getSeedData();
  const mentions = getBrandMentions(data);

  const totalCompetitor = mentions.competitors.reduce((s, m) => s + m.count, 0);
  const totalOwn = mentions.own.reduce((s, m) => s + m.count, 0);
  const maxOwn = Math.max(...mentions.own.map(m => m.count), 1);

  const ts = new Date(data.timestamp);
  const synced = ts.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
    ' at ' + ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';

  // Categories that have at least one mention
  const activeCategories = Object.entries(mentions.competitorsByCategory)
    .map(([cat, brands]) => ({
      cat,
      brands: brands.sort((a, b) => b.count - a.count),
      total: brands.reduce((s, b) => s + b.count, 0),
    }))
    .sort((a, b) => b.total - a.total);

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

      {/* ══════════ GCPL BRAND VOICE ══════════ */}
      <div className="mb-12">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] mb-4 pb-2 border-b-2 border-ink flex items-center gap-2"
          style={{ color: 'var(--accent-deep)' }}>
          GCPL Brand Voice
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-[1px] bg-rule">
          {mentions.own
            .filter(m => m.count > 0)
            .sort((a, b) => b.count - a.count)
            .map((m, i) => (
              <div key={i} className="bg-paper p-4 flex items-center justify-between">
                <span className="text-[13px] font-medium">{m.name}</span>
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
            ))}
          {mentions.own.filter(m => m.count > 0).length === 0 && (
            <div className="bg-paper p-4 col-span-3">
              <p className="font-mono text-[10px] text-ink-faint">No GCPL brand mentions found in current data</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════ COMPETITOR WATCH — by category ══════════ */}
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
                  <span style={{ fontSize: 14 }}>{CAT_ICON[cat] || '📊'}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] font-medium"
                    style={{ color: 'var(--ink)' }}>
                    {cat}
                  </span>
                </div>
                <span className="font-mono text-[10px]" style={{ color: 'var(--ink-faint)' }}>
                  {total} mention{total !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Brand rows */}
              <div className="px-4 py-2">
                {brands.map((m, j) => (
                  <div key={j} className="flex items-center justify-between py-2"
                    style={{ borderBottom: j < brands.length - 1 ? '1px solid var(--rule)' : 'none' }}>
                    <span className="text-[13px]" style={{ color: m.count > 0 ? 'var(--ink)' : 'var(--ink-faint)' }}>
                      {m.name}
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
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
