'use client';

import SignalCard from './SignalCard';

export default function FeedGrid({ signals = [], title = 'Feed', onSelectSignal }) {
  return (
    <section>
      {/* Header */}
      <div
        className="flex items-baseline gap-3 mb-0"
        style={{
          paddingBottom: 16,
          borderBottom: '2px solid var(--ink)',
        }}
      >
        <h1
          className="font-display font-semibold"
          style={{
            fontSize: 36,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
          }}
        >
          {title}
        </h1>
        <span
          className="font-mono uppercase"
          style={{
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.06em',
            color: 'var(--ink-faint)',
          }}
        >
          {signals.length} signal{signals.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      {signals.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 0,
          }}
        >
          {signals.map((signal, i) => (
            <div
              key={signal.id || signal.url || i}
              style={{
                background: 'var(--paper)',
                borderBottom: '1px solid var(--rule)',
                borderRight: '1px solid var(--rule)',
              }}
            >
              <SignalCard signal={signal} onSelect={onSelectSignal} />
            </div>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div
          className="flex flex-col items-center justify-center text-center"
          style={{
            padding: '80px 24px',
            borderBottom: '1px solid var(--rule)',
          }}
        >
          <div
            className="font-display italic mb-2"
            style={{
              fontSize: 'var(--fs-xl)',
              color: 'var(--ink-faint)',
            }}
          >
            No data yet
          </div>
          <p
            className="font-body"
            style={{
              fontSize: 'var(--fs-sm)',
              color: 'var(--ink-soft)',
            }}
          >
            Run the pipeline to begin collection.
          </p>
        </div>
      )}
    </section>
  );
}
