'use client';

export default function StatStrip({ stats = [] }) {
  const displayStats = stats.slice(0, 4);

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
          gridTemplateColumns: `repeat(${displayStats.length || 4}, 1fr)`,
        }}
      >
        {displayStats.map((stat, i) => (
          <div
            key={stat.label || i}
            style={{
              padding: '22px 0',
              borderLeft: i > 0 ? '1px solid var(--rule)' : 'none',
              paddingLeft: i > 0 ? 'var(--gutter)' : 0,
              paddingRight: 'var(--gutter)',
            }}
          >
            {/* Value */}
            <div
              className="font-display italic font-bold"
              style={{
                fontSize: 'clamp(40px, 4vw, 64px)',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: stat.color || 'var(--accent)',
                fontVariantNumeric: 'tabular-nums lining-nums',
                fontFeatureSettings: "'tnum' 1, 'lnum' 1",
                marginBottom: 6,
              }}
            >
              {stat.value ?? '--'}
            </div>

            {/* Label */}
            <div
              className="font-mono uppercase"
              style={{
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                color: 'var(--ink-soft)',
                lineHeight: 1,
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
