'use client';

import { useEffect, useRef } from 'react';

export default function DetailDrawer({ signal, onClose }) {
  const drawerRef = useRef(null);
  const isOpen = Boolean(signal);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Normalize fields: support both trend objects and raw signal objects
  const s = signal || {};
  const title = s.trend_name || s.title || '';
  const platform = s.platform || s.label?.replace(/[\[\]]/g, '') || s.source || '';
  const source = s.source_platform || s.subreddit ? `r/${s.subreddit}` : s.source || '';
  const url = s.url || s.link || '';
  const context = s.context || s.summary || '';
  const insight = s.result || '';
  const metric = s.metric || '';

  // Build metadata from available fields
  const meta = {};
  if (s.score) meta['Reddit Score'] = s.score;
  if (s.num_comments) meta['Comments'] = s.num_comments;
  if (s.velocity) meta['Velocity'] = s.velocity.toFixed(1);
  if (s.price) meta['Price'] = s.price;
  if (s.rating) meta['Rating'] = `${s.rating} / 5`;
  if (s.review_count) meta['Reviews'] = s.review_count.toLocaleString();
  if (s.rank) meta['Rank'] = `#${s.rank}`;
  if (s.brand) meta['Brand'] = s.brand;
  if (s.category) meta['Category'] = s.category;
  if (s.engagement) meta['Engagement'] = s.engagement;
  if (s.published) meta['Published'] = new Date(s.published).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 transition-opacity"
        style={{
          background: 'rgba(17, 24, 26, 0.55)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transitionDuration: 'var(--dur)',
          transitionTimingFunction: 'var(--ease)',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 480,
          maxWidth: '100vw',
          background: 'var(--paper)',
          borderLeft: '1px solid var(--rule)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms var(--ease)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4"
          style={{ borderBottom: '1px solid var(--rule)' }}>
          <div className="flex-1 pr-4">
            {platform && (
              <span className="font-mono uppercase inline-flex items-center mb-3"
                style={{
                  fontSize: '10px', fontWeight: 500, letterSpacing: '0.08em',
                  background: 'var(--ink)', color: 'var(--paper)',
                  padding: '2px 8px', borderRadius: 'var(--radius)', lineHeight: 1.5,
                }}>
                {platform}
              </span>
            )}
            <h2 className="font-display font-semibold"
              style={{ fontSize: 26, lineHeight: 1.2, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
              {title}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="flex items-center justify-center cursor-pointer"
            style={{
              width: 32, height: 32, background: 'none',
              border: '1px solid var(--rule)', borderRadius: 'var(--radius)',
              color: 'var(--ink-soft)', fontSize: 16, lineHeight: 1, flexShrink: 0,
            }}
            aria-label="Close drawer">
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Source & Metric */}
          <div className="flex flex-wrap gap-2 mb-5">
            {source && <span className="font-mono text-[9px] uppercase tracking-[0.06em] px-2 py-[2px] border rounded-editorial" style={{ borderColor: 'var(--rule)', color: 'var(--ink-soft)' }}>{source}</span>}
            {metric && <span className="font-mono text-[9px] uppercase tracking-[0.06em] px-2 py-[2px] border rounded-editorial" style={{ borderColor: 'var(--rule)', color: 'var(--ink-soft)' }}>{metric}</span>}
          </div>

          {/* Context */}
          {context && (
            <div className="mb-6">
              <div className="font-mono uppercase mb-2"
                style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>
                Context
              </div>
              <p className="font-body" style={{ fontSize: 'var(--fs-base)', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
                {context}
              </p>
            </div>
          )}

          {/* GCPL Insight (from AI trend analysis) */}
          {insight && (
            <div className="mb-6">
              <div className="font-mono uppercase mb-2"
                style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>
                GCPL Insight
              </div>
              <div style={{
                borderLeft: '2px solid var(--accent)', background: 'var(--paper-deep)',
                padding: '12px 16px', borderRadius: 'var(--radius)',
              }}>
                <p className="font-body" style={{ fontSize: 'var(--fs-base)', color: 'var(--ink)', lineHeight: 1.6 }}>
                  {insight}
                </p>
              </div>
            </div>
          )}

          {/* Metadata table */}
          {Object.keys(meta).length > 0 && (
            <div className="mb-6">
              <div className="font-mono uppercase mb-2"
                style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>
                Signal Data
              </div>
              <div style={{ borderTop: '1px solid var(--rule)' }}>
                {Object.entries(meta).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2"
                    style={{ borderBottom: '1px solid var(--rule)' }}>
                    <span className="font-mono uppercase"
                      style={{ fontSize: '10px', color: 'var(--ink-faint)', letterSpacing: '0.06em' }}>
                      {key}
                    </span>
                    <span className="font-body" style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink)' }}>
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Original URL */}
          {url && (
            <div className="mb-6">
              <a href={url} target="_blank" rel="noopener noreferrer" className="font-mono uppercase"
                style={{ fontSize: '11px', letterSpacing: '0.06em', color: 'var(--accent-deep)' }}>
                View original source &#8599;
              </a>
            </div>
          )}
        </div>

        {/* Footer: WhatsApp share */}
        <div className="px-6 py-4" style={{ borderTop: '1px solid var(--rule)' }}>
          <a href={url
              ? `https://wa.me/?text=${encodeURIComponent(title + '\n\n' + url)}`
              : `https://wa.me/?text=${encodeURIComponent(title)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 font-mono uppercase no-underline"
            style={{
              fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em',
              color: '#fff', background: 'linear-gradient(135deg, #5BC8FF, #2B95DA)',
              borderRadius: 8, textDecoration: 'none', width: '100%',
            }}>
            Share on WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
