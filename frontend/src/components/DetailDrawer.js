'use client';

import { useEffect, useRef } from 'react';

export default function DetailDrawer({ signal, onClose }) {
  const drawerRef = useRef(null);
  const isOpen = Boolean(signal);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const {
    title = '',
    platform = '',
    category = '',
    source = '',
    description = '',
    url = '',
    gcplInsight = '',
    timestamp = '',
    metadata = {},
  } = signal || {};

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
          transition: `transform 280ms var(--ease)`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 pt-5 pb-4"
          style={{ borderBottom: '1px solid var(--rule)' }}
        >
          <div className="flex-1 pr-4">
            {/* Platform badge */}
            {platform && (
              <span
                className="font-mono uppercase inline-flex items-center mb-3"
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

            {/* Title */}
            <h2
              className="font-display font-semibold"
              style={{
                fontSize: 26,
                lineHeight: 1.2,
                color: 'var(--ink)',
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </h2>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer"
            style={{
              width: 32,
              height: 32,
              background: 'none',
              border: '1px solid var(--rule)',
              borderRadius: 'var(--radius)',
              color: 'var(--ink-soft)',
              fontSize: 16,
              lineHeight: 1,
              flexShrink: 0,
            }}
            aria-label="Close drawer"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Source tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {source && (
              <span className="trend-badge">{source}</span>
            )}
            {category && (
              <span className="trend-badge">{category}</span>
            )}
            {timestamp && (
              <span className="trend-badge">{timestamp}</span>
            )}
          </div>

          {/* Context section */}
          {description && (
            <div className="mb-6">
              <div
                className="font-mono uppercase mb-2"
                style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  color: 'var(--ink-faint)',
                }}
              >
                Context
              </div>
              <p
                className="font-body"
                style={{
                  fontSize: 'var(--fs-base)',
                  color: 'var(--ink-soft)',
                  lineHeight: 1.7,
                }}
              >
                {description}
              </p>
            </div>
          )}

          {/* GCPL Insight section */}
          {gcplInsight && (
            <div className="mb-6">
              <div
                className="font-mono uppercase mb-2"
                style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  color: 'var(--ink-faint)',
                }}
              >
                GCPL Insight
              </div>
              <div
                style={{
                  borderLeft: '2px solid var(--accent)',
                  background: 'var(--paper-deep)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius)',
                }}
              >
                <p
                  className="font-body"
                  style={{
                    fontSize: 'var(--fs-base)',
                    color: 'var(--ink)',
                    lineHeight: 1.6,
                  }}
                >
                  {gcplInsight}
                </p>
              </div>
            </div>
          )}

          {/* Metadata */}
          {Object.keys(metadata).length > 0 && (
            <div className="mb-6">
              <div
                className="font-mono uppercase mb-2"
                style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  color: 'var(--ink-faint)',
                }}
              >
                Signal Metadata
              </div>
              <div
                style={{
                  borderTop: '1px solid var(--rule)',
                }}
              >
                {Object.entries(metadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-2"
                    style={{
                      borderBottom: '1px solid var(--rule)',
                    }}
                  >
                    <span
                      className="font-mono uppercase"
                      style={{
                        fontSize: '10px',
                        color: 'var(--ink-faint)',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {key}
                    </span>
                    <span
                      className="font-body"
                      style={{
                        fontSize: 'var(--fs-sm)',
                        color: 'var(--ink)',
                      }}
                    >
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
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono uppercase"
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.06em',
                  color: 'var(--accent-deep)',
                }}
              >
                View original source &#8599;
              </a>
            </div>
          )}
        </div>

        {/* Footer: WhatsApp share */}
        <div
          className="px-6 py-4"
          style={{ borderTop: '1px solid var(--rule)' }}
        >
          <a
            href={
              url
                ? `https://wa.me/?text=${encodeURIComponent(title + '\n\n' + url)}`
                : `https://wa.me/?text=${encodeURIComponent(title)}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 font-mono uppercase no-underline"
            style={{
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.06em',
              color: '#fff',
              background: 'linear-gradient(135deg, #5BC8FF, #2B95DA)',
              borderRadius: 8,
              textDecoration: 'none',
              width: '100%',
            }}
          >
            Share on WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
