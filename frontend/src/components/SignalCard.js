'use client';

export default function SignalCard({ signal = {}, onSelect }) {
  const {
    title = '',
    platform = '',
    category = '',
    source = '',
    description = '',
    url = '',
    gcplInsight = '',
    timestamp = '',
  } = signal;

  return (
    <article
      className="group cursor-pointer transition-colors"
      style={{
        background: 'var(--paper)',
        borderBottom: '1px solid var(--rule)',
        padding: 24,
        borderRadius: 'var(--radius)',
      }}
      onClick={() => onSelect?.(signal)}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = 'var(--paper-deep)')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = 'var(--paper)')
      }
    >
      {/* Top row: platform badge + category chip */}
      <div className="flex items-center gap-2 mb-3">
        {platform && (
          <span
            className="font-mono uppercase inline-flex items-center"
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              background: 'var(--ink)',
              color: 'var(--paper)',
              padding: '2px 8px',
              borderRadius: 'var(--radius)',
              lineHeight: 1.5,
            }}
          >
            {platform}
          </span>
        )}
        {category && (
          <span
            className="font-mono uppercase"
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: 'var(--ink-soft)',
              border: '1px solid var(--rule)',
              padding: '2px 8px',
              borderRadius: 'var(--radius)',
              lineHeight: 1.5,
            }}
          >
            {category}
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        className="font-display font-medium mb-2"
        style={{
          fontSize: 'var(--fs-lg)',
          lineHeight: 1.3,
          color: 'var(--ink)',
        }}
      >
        {title}
      </h3>

      {/* Source info */}
      {source && (
        <div
          className="font-mono uppercase mb-2"
          style={{
            fontSize: '10px',
            color: 'var(--ink-soft)',
            letterSpacing: '0.06em',
          }}
        >
          {source}
          {timestamp && (
            <>
              {' '}&middot;{' '}
              {timestamp}
            </>
          )}
        </div>
      )}

      {/* Description */}
      {description && (
        <p
          className="font-body text-sm mb-4"
          style={{
            color: 'var(--ink-soft)',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </p>
      )}

      {/* GCPL Insight */}
      {gcplInsight && (
        <div
          className="mb-4"
          style={{
            borderLeft: '2px solid var(--accent)',
            background: 'var(--paper-deep)',
            padding: '10px 14px',
            borderRadius: 'var(--radius)',
          }}
        >
          <span
            className="font-mono uppercase block mb-1"
            style={{
              fontSize: '10px',
              fontWeight: 500,
              color: 'var(--accent-deep)',
              letterSpacing: '0.08em',
            }}
          >
            GCPL Insight
          </span>
          <p
            className="font-body"
            style={{
              fontSize: 'var(--fs-sm)',
              color: 'var(--ink-soft)',
              lineHeight: 1.5,
            }}
          >
            {gcplInsight}
          </p>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="font-mono uppercase cursor-pointer"
          style={{
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            color: 'var(--accent-deep)',
            background: 'none',
            border: 'none',
            padding: 0,
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            textDecorationThickness: '1px',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(signal);
          }}
        >
          View details
        </button>

        {url && (
          <a
            href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono uppercase no-underline"
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.06em',
              color: 'var(--ink-soft)',
              border: '1px solid var(--rule)',
              padding: '3px 10px',
              borderRadius: 'var(--radius)',
              textDecoration: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            Share
          </a>
        )}
      </div>
    </article>
  );
}
