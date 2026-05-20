'use client';

import { useEffect, useRef, useState } from 'react';
import { findSourceUrl, findSupportingSignals, getSeedData } from '@/lib/data';

export default function DetailDrawer({ signal, onClose }) {
  const drawerRef = useRef(null);
  const isOpen = Boolean(signal);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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
  const data = getSeedData();
  const title = s.trend_name || s.title || '';
  const platform = s.platform || s.label?.replace(/[\[\]]/g, '') || s.source || '';
  const source = s.source_platform || (s.subreddit ? `r/${s.subreddit}` : '') || s.source || '';
  let url = s.url || s.link || '';
  if (!url && s.trend_name) {
    url = findSourceUrl(s, data);
  }

  // Generate context & URL for bare signals (Google Trends, Social, Pinterest)
  const platformLower = platform.toLowerCase();
  let context = s.context || s.summary || '';
  let insight = s.result || '';
  const metric = s.metric || '';

  if (!url && title) {
    if (platformLower.includes('google')) {
      url = `https://trends.google.com/trends/explore?q=${encodeURIComponent(title)}&geo=IN`;
    } else if (platformLower.includes('social') || platformLower.includes('twitter')) {
      url = `https://x.com/search?q=${encodeURIComponent(title)}&src=trend_click`;
    } else if (platformLower.includes('pinterest')) {
      url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(title)}`;
    } else if (platformLower.includes('youtube')) {
      url = `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`;
    }
  }
  if (!context && title) {
    if (platformLower.includes('google')) {
      context = `"${title}" is a breakout search query on Google Trends India, indicating a surge in consumer search interest. This signal was detected by monitoring real-time trending searches across India.`;
    } else if (platformLower.includes('social') || platformLower.includes('twitter')) {
      context = `"${title}" is trending on X / Twitter, reflecting real-time social conversation and buzz around this topic in India.`;
    } else if (platformLower.includes('pinterest')) {
      context = `"${title}" is trending on Pinterest, indicating rising visual search interest and inspiration-seeking behaviour among consumers.`;
    } else if (platformLower.includes('youtube')) {
      context = `"${title}" is trending on YouTube India, indicating rising creator and consumer interest around this topic. YouTube beauty and grooming content drives significant purchase decisions.`;
    } else if (platformLower.includes('news') || platformLower.includes('rss')) {
      context = `Editorial coverage detected via news and RSS monitoring. This signal reflects media attention and industry interest.`;
    }
  }
  if (!insight && !s.trend_name && title) {
    if (platformLower.includes('google')) {
      insight = 'Google search breakout trend — rising consumer interest detected. Monitor for sustained search volume to assess if this represents an emerging opportunity.';
    } else if (platformLower.includes('social') || platformLower.includes('twitter')) {
      insight = 'Social trending signal — real-time conversation spike detected. Evaluate sentiment and context to determine relevance for brand strategy.';
    } else if (platformLower.includes('pinterest')) {
      insight = 'Visual discovery trend — rising saves and searches on Pinterest. Early indicator of consumer aspiration and potential future demand.';
    }
  }

  // Build metadata from available fields (for raw signal objects)
  const meta = {};
  if (s.score) meta['Reddit Score'] = s.score;
  if (s.num_comments) meta['Comments'] = s.num_comments;
  if (s.velocity) meta['Velocity'] = s.velocity.toFixed(1);
  if (s.price) meta['Price'] = s.price;
  if (s.rating) meta['Rating'] = `${s.rating} / 5`;
  if (s.review_count) meta['Reviews'] = s.review_count.toLocaleString();
  if (s.rank) meta['Rank'] = `#${s.rank}`;
  if (s.brand) meta['Brand'] = s.brand;
  if (s.views) meta['Views'] = Number(s.views).toLocaleString();
  if (s.likes) meta['Likes'] = Number(s.likes).toLocaleString();
  if (s.comment_count) meta['Comments'] = Number(s.comment_count).toLocaleString();
  if (s.channel) meta['Channel'] = s.channel;
  if (s.category) meta['Category'] = s.category;
  if (!s.views && s.engagement) meta['Engagement'] = s.engagement;
  if (s.published) meta['Published'] = new Date(s.published).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Cross-platform evidence (only for AI trend objects)
  const evidence = s.trend_name ? findSupportingSignals(s, data) : null;

  // Helper: icon for platform type
  const platformIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('amazon')) return '\u{1F4E6}';
    if (n.includes('flipkart')) return '\u{1F6D2}';
    if (n.includes('nykaa')) return '\u{1F48E}';
    if (n.includes('reddit')) return '\u{1F4AC}';
    if (n.includes('instagram')) return '\u{1F4F8}';
    if (n.includes('news') || n.includes('rss')) return '\u{1F4F0}';
    if (n.includes('pinterest')) return '\u{1F4CC}';
    if (n.includes('google')) return '\u{1F50D}';
    if (n.includes('social') || n.includes('twitter')) return '\u{1F426}';
    if (n.includes('youtube')) return '\u{1F3AC}';
    return '\u{1F4CA}';
  };

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
          width: isMobile ? '100vw' : 480,
          maxWidth: '100vw',
          background: 'var(--paper)',
          borderLeft: isMobile ? 'none' : '1px solid var(--rule)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms var(--ease)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pt-5 pb-4"
          style={{ borderBottom: '1px solid var(--rule)', paddingLeft: isMobile ? 16 : 24, paddingRight: isMobile ? 16 : 24 }}>
          <div className="flex-1 pr-4 min-w-0">
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
              style={{ fontSize: isMobile ? 20 : 26, lineHeight: 1.2, color: 'var(--ink)', letterSpacing: '-0.01em', wordBreak: 'break-word' }}>
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
        <div className="flex-1 overflow-y-auto py-5" style={{ paddingLeft: isMobile ? 16 : 24, paddingRight: isMobile ? 16 : 24 }}>
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

          {/* ========== WHY THIS IS TRENDING — cross-platform evidence ========== */}
          {evidence && (
            <div className="mb-6">
              <div className="font-mono uppercase mb-2"
                style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>
                Why This Is Trending
              </div>

              {/* Summary bar */}
              <div className="mb-3 py-2 px-3" style={{
                background: 'var(--paper-deep)', borderRadius: 'var(--radius)',
                border: '1px solid var(--rule)',
              }}>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-deep)', fontWeight: 600 }}>
                  {evidence.platformCount >= 3
                    ? `Cross-platform trend: detected across ${evidence.platformCount} independent sources`
                    : evidence.platformCount === 2
                    ? `Multi-platform signal: detected on ${evidence.platformCount} platforms`
                    : `Platform signal: ${evidence.total} supporting data point${evidence.total > 1 ? 's' : ''}`}
                </span>
                <div className="font-mono mt-1" style={{ fontSize: '10px', color: 'var(--ink-faint)' }}>
                  {evidence.total} matching signal{evidence.total > 1 ? 's' : ''} found in raw pipeline data
                </div>
              </div>

              {/* Per-platform evidence cards */}
              {Object.entries(evidence.platforms).map(([platName, info]) => (
                <div key={platName} className="mb-3" style={{
                  borderTop: '1px solid var(--rule)', paddingTop: 8,
                }}>
                  {/* Platform header */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono uppercase" style={{
                      fontSize: '10px', fontWeight: 600, color: 'var(--ink)',
                      letterSpacing: '0.06em',
                    }}>
                      {platformIcon(platName)} {platName}
                    </span>
                    <span className="font-mono" style={{
                      fontSize: '10px', color: 'var(--ink-faint)',
                    }}>
                      {info.count} signal{info.count > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Aggregate metrics row */}
                  <div className="flex flex-wrap gap-3 mb-2">
                    {info.avgRating && (
                      <span className="font-mono" style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>
                        &#9733; {info.avgRating} avg rating
                      </span>
                    )}
                    {info.totalReviews > 0 && (
                      <span className="font-mono" style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>
                        {info.totalReviews.toLocaleString()} reviews
                      </span>
                    )}
                    {info.totalUpvotes > 0 && (
                      <span className="font-mono" style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>
                        &#9650; {info.totalUpvotes.toLocaleString()} upvotes
                      </span>
                    )}
                    {info.totalComments > 0 && (
                      <span className="font-mono" style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>
                        {info.totalComments.toLocaleString()} comments
                      </span>
                    )}
                    {info.avgVelocity && (
                      <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-deep)', fontWeight: 600 }}>
                        &#9889; {info.avgVelocity} velocity
                      </span>
                    )}
                  </div>

                  {/* Top matching signal titles */}
                  {info.top.slice(0, 2).map((sig, i) => (
                    <div key={i} className="font-body" style={{
                      fontSize: '11px', color: 'var(--ink-faint)',
                      lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden',
                      textOverflow: 'ellipsis', paddingLeft: 8,
                      borderLeft: '1px solid var(--rule)', marginBottom: 2,
                    }}>
                      {sig.title}
                    </div>
                  ))}
                </div>
              ))}

              {/* Detected keywords */}
              <div className="mt-3 flex flex-wrap gap-1">
                {evidence.keywords.map((kw, i) => (
                  <span key={i} className="font-mono" style={{
                    fontSize: '9px', color: 'var(--ink-faint)',
                    border: '1px solid var(--rule)', borderRadius: 3,
                    padding: '1px 5px', lineHeight: 1.4,
                  }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata table (for raw signal objects) */}
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

          {/* Original URL — platform-aware label */}
          {url && (
            <div className="mb-6">
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono uppercase no-underline py-2 px-4"
                style={{
                  fontSize: '11px', letterSpacing: '0.06em', fontWeight: 500,
                  color: 'var(--paper)', background: 'var(--accent-deep)',
                  borderRadius: 'var(--radius)', textDecoration: 'none',
                }}>
                {platformLower.includes('amazon') ? 'View on Amazon' :
                 platformLower.includes('flipkart') ? 'View on Flipkart' :
                 platformLower.includes('nykaa') ? 'View on Nykaa' :
                 platformLower.includes('reddit') ? 'View on Reddit' :
                 platformLower.includes('instagram') ? 'View on Instagram' :
                 platformLower.includes('youtube') ? 'View on YouTube' :
                 'View original source'} &#8599;
              </a>
            </div>
          )}
        </div>

        {/* Footer: WhatsApp share */}
        <div className="py-4" style={{ paddingLeft: isMobile ? 16 : 24, paddingRight: isMobile ? 16 : 24, borderTop: '1px solid var(--rule)' }}>
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
