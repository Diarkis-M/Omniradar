'use client';

import { useEffect, useState } from 'react';

export default function StatStrip({ stats = [] }) {
  const displayStats = stats.slice(0, 4);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const cols = isMobile ? 2 : displayStats.length || 4;

  return (
    <div
      style={{
        borderTop: '2px solid var(--ink)',
        borderBottom: '1px solid var(--rule)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {displayStats.map((stat, i) => {
          // On mobile 2-col grid: left column items have no left border
          const showLeftBorder = isMobile ? (i % 2 !== 0) : (i > 0);
          return (
            <div
              key={stat.label || i}
              style={{
                padding: isMobile ? '14px 0' : '22px 0',
                borderLeft: showLeftBorder ? '1px solid var(--rule)' : 'none',
                borderBottom: (isMobile && i < displayStats.length - 2) ? '1px solid var(--rule)' : 'none',
                paddingLeft: showLeftBorder ? 'var(--gutter)' : 0,
                paddingRight: 'var(--gutter)',
              }}
            >
              {/* Value */}
              <div
                className="font-display italic font-bold"
                style={{
                  fontSize: isMobile ? 'clamp(28px, 8vw, 36px)' : 'clamp(40px, 4vw, 64px)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  color: stat.color || 'var(--accent)',
                  fontVariantNumeric: 'tabular-nums lining-nums',
                  fontFeatureSettings: "'tnum' 1, 'lnum' 1",
                  marginBottom: 4,
                }}
              >
                {stat.value ?? '--'}
              </div>

              {/* Label */}
              <div
                className="font-mono uppercase"
                style={{
                  fontSize: isMobile ? '9px' : '10px',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  color: 'var(--ink-soft)',
                  lineHeight: 1.2,
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
