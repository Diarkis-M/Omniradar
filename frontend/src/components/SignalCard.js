'use client';
import { categorizeSignal } from '@/lib/data';

export default function SignalCard({ signal = {}, onSelect }) {
  const title = signal.title || '';
  const platform = signal.platform || signal.source || '';
  const category = signal.category || categorizeSignal(signal);
  const url = signal.url || signal.link || '';
  const subreddit = signal.subreddit || '';
  const price = signal.price || '';
  const rating = signal.rating || 0;
  const reviewCount = signal.review_count || 0;
  const rank = signal.rank || 0;
  const brand = signal.brand || '';
  const score = signal.score || 0;
  const numComments = signal.num_comments || 0;

  // Build subtitle from available fields
  const channel = signal.channel || '';

  let subtitle = '';
  if (subreddit) subtitle = `r/${subreddit}`;
  else if (channel) subtitle = channel;
  else if (brand) subtitle = brand;
  else if (signal.query) subtitle = signal.query.replace('site:instagram.com ', '').replace('site:youtube.com ', '');
  else if (signal.published) subtitle = new Date(signal.published).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  // Generate context line for bare signals (Google, Social, Pinterest)
  const plat = platform.toLowerCase();
  let signalContext = '';
  if (!subreddit && !brand && !price && score === 0 && rating === 0 && !signal.published) {
    if (plat.includes('google'))  signalContext = 'Breakout search — Google Trends India';
    else if (plat.includes('social') || plat.includes('twitter'))  signalContext = 'Trending topic — X / Twitter India';
    else if (plat.includes('pinterest'))  signalContext = 'Trending pins — Pinterest';
    else if (plat.includes('youtube'))  signalContext = 'Trending video — YouTube India';
    else if (plat.includes('news') || plat.includes('rss'))  signalContext = 'Editorial coverage — News / RSS';
  }

  return (
    <article
      className="group cursor-pointer transition-colors"
      style={{ background: 'var(--paper)', padding: 24, borderRadius: 'var(--radius)' }}
      onClick={() => onSelect?.(signal)}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--paper-deep)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--paper)')}
    >
      {/* Top row: platform badge + category chip */}
      <div className="flex items-center gap-2 mb-3">
        {platform && (
          <span className="font-mono uppercase inline-flex items-center"
            style={{
              fontSize: '10px', fontWeight: 500, letterSpacing: '0.08em',
              background: 'var(--ink)', color: 'var(--paper)',
              padding: '2px 8px', borderRadius: 'var(--radius)', lineHeight: 1.5,
            }}>
            {platform}
          </span>
        )}
        {category && category !== 'General' && (
          <span className="font-mono uppercase"
            style={{
              fontSize: '10px', fontWeight: 500, letterSpacing: '0.08em',
              color: 'var(--ink-soft)', border: '1px solid var(--rule)',
              padding: '2px 8px', borderRadius: 'var(--radius)', lineHeight: 1.5,
            }}>
            {category}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display font-medium mb-2"
        style={{ fontSize: 'var(--fs-lg)', lineHeight: 1.3, color: 'var(--ink)' }}>
        {title}
      </h3>

      {/* Subtitle line */}
      {subtitle && (
        <div className="font-mono uppercase mb-2"
          style={{ fontSize: '10px', color: 'var(--ink-soft)', letterSpacing: '0.06em' }}>
          {subtitle}
        </div>
      )}

      {/* Signal context for bare signals (Google/Social/Pinterest) */}
      {signalContext && (
        <p className="font-body mb-2"
          style={{ fontSize: '12px', color: 'var(--ink-faint)', lineHeight: 1.4 }}>
          {signalContext}
        </p>
      )}

      {/* Stats row for e-commerce signals */}
      {(price || rating > 0 || rank > 0) && (
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {price && (
            <span className="font-mono" style={{ fontSize: '12px', color: 'var(--accent-deep)', fontWeight: 600 }}>
              {price}
            </span>
          )}
          {rating > 0 && (
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
              &#9733; {rating}
            </span>
          )}
          {reviewCount > 0 && (
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>
              {reviewCount.toLocaleString()} reviews
            </span>
          )}
          {rank > 0 && (
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>
              #{rank}
            </span>
          )}
        </div>
      )}

      {/* Reddit stats */}
      {score > 0 && (
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-deep)' }}>
            &#9650; {score}
          </span>
          {numComments > 0 && (
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>
              {numComments} comments
            </span>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
        <button type="button" className="font-mono uppercase cursor-pointer"
          style={{
            fontSize: '10px', fontWeight: 500, letterSpacing: '0.08em',
            color: 'var(--accent-deep)', background: 'none', border: 'none',
            padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px',
            textDecorationThickness: '1px',
          }}
          onClick={(e) => { e.stopPropagation(); onSelect?.(signal); }}>
          View details
        </button>
        <div className="flex items-center gap-2">
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="font-mono uppercase no-underline"
              style={{
                fontSize: '10px', fontWeight: 500, letterSpacing: '0.06em',
                color: 'var(--accent-deep)', border: '1px solid var(--accent)',
                padding: '3px 10px', borderRadius: 'var(--radius)', textDecoration: 'none',
              }}
              onClick={(e) => e.stopPropagation()}>
              {plat.includes('amazon') ? 'Amazon' : plat.includes('flipkart') ? 'Flipkart' : plat.includes('nykaa') ? 'Nykaa' : plat.includes('youtube') ? 'YouTube' : 'Source'} &#8599;
            </a>
          )}
          {url && (
            <a href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`}
              target="_blank" rel="noopener noreferrer"
              className="font-mono uppercase no-underline"
              style={{
                fontSize: '10px', fontWeight: 500, letterSpacing: '0.06em',
                color: 'var(--ink-soft)', border: '1px solid var(--rule)',
                padding: '3px 10px', borderRadius: 'var(--radius)', textDecoration: 'none',
              }}
              onClick={(e) => e.stopPropagation()}>
              Share
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
