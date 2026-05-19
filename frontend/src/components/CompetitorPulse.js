'use client';

export default function CompetitorPulse({ mentions = [] }) {
  const sorted = [...mentions]
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 7);

  const maxCount = sorted.length > 0 ? Math.max(...sorted.map((m) => m.count || 0)) : 1;

  return (
    <section>
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{
          paddingBottom: 12,
          borderBottom: '2px solid var(--ink)',
          marginBottom: 16,
        }}
      >
        <span
          className="font-mono uppercase font-medium"
          style={{
            fontSize: '11px',
            letterSpacing: '0.08em',
            color: 'var(--ink)',
          }}
        >
          Competitor Pulse
        </span>
        <a
          href="/brands"
          className="font-mono uppercase"
          style={{
            fontSize: '10px',
            letterSpacing: '0.06em',
            color: 'var(--accent-deep)',
            textDecorationThickness: '1px',
            textUnderlineOffset: '2px',
          }}
        >
          Full report
        </a>
      </div>

      {/* Bars */}
      {sorted.length > 0 ? (
        <div className="flex flex-col gap-4">
          {sorted.map((item) => {
            const pct = maxCount > 0 ? ((item.count || 0) / maxCount) * 100 : 0;
            return (
              <div key={item.name} className="flex items-center gap-3">
                {/* Brand name */}
                <span
                  className="font-body flex-shrink-0"
                  style={{
                    fontSize: 14,
                    color: 'var(--ink)',
                    width: 100,
                  }}
                >
                  {item.name}
                </span>

                {/* Bar */}
                <div
                  className="flex-1 relative"
                  style={{ height: 3, background: 'var(--surface-faint)' }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${pct}%`,
                      background: 'var(--accent)',
                      borderRadius: 'var(--radius)',
                      transition: 'width 400ms var(--ease)',
                    }}
                  />
                </div>

                {/* Count */}
                <span
                  className="font-display italic font-bold flex-shrink-0"
                  style={{
                    fontSize: 'var(--fs-base)',
                    color: 'var(--ink)',
                    fontVariantNumeric: 'tabular-nums',
                    width: 36,
                    textAlign: 'right',
                  }}
                >
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p
          className="font-body"
          style={{
            fontSize: 'var(--fs-sm)',
            color: 'var(--ink-faint)',
            padding: '16px 0',
          }}
        >
          No competitor mentions found.
        </p>
      )}
    </section>
  );
}
