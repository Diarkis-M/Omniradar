'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: '⌂', href: '/', section: 'overview' },
  { key: 'digest', label: 'AI Digest', icon: '✦', href: '/digest', section: 'overview' },
  { key: 'brand-health', label: 'Brand Health', icon: '♡', href: '/brands', section: 'overview' },
  { key: 'all', label: 'All Feeds', icon: '○', href: '/feeds', section: 'feeds' },
  { key: 'amazon', label: 'Amazon', icon: 'A', href: '/feed/amazon', section: 'feeds' },
  { key: 'flipkart', label: 'Flipkart', icon: 'F', href: '/feed/flipkart', section: 'feeds' },
  { key: 'nykaa', label: 'Nykaa', icon: 'Ny', href: '/feed/nykaa', section: 'feeds' },
  { key: 'reddit', label: 'Reddit', icon: 'R', href: '/feed/reddit', section: 'feeds' },
  { key: 'news', label: 'News', icon: 'N', href: '/feed/news', section: 'feeds' },
  { key: 'instagram', label: 'Instagram', icon: 'Ig', href: '/feed/instagram', section: 'feeds' },
  { key: 'google', label: 'Google', icon: 'G', href: '/feed/google', section: 'feeds' },
  { key: 'competitors', label: 'Competitors', icon: '⚔', href: '/feed/competitors', section: 'feeds' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [isOnline] = useState(true);

  const lastSynced = new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const filtered = search
    ? NAV_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      )
    : NAV_ITEMS;

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-30"
      style={{
        width: 240,
        background: 'var(--paper-deep)',
        borderRight: '1px solid var(--rule)',
      }}
    >
      {/* Wordmark */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full animate-scout-pulse"
            style={{ background: 'var(--positive)' }}
          />
          <span
            className="font-display italic font-bold text-xl"
            style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}
          >
            Omniradar
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5 mt-2">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{
              background: isOnline ? 'var(--positive)' : 'var(--warning)',
            }}
          />
          <span
            className="font-mono uppercase"
            style={{
              fontSize: 'var(--fs-xs)',
              color: 'var(--ink-soft)',
              letterSpacing: '0.06em',
            }}
          >
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <input
          type="text"
          placeholder="Search trends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full font-body text-sm outline-none"
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--rule)',
            borderRadius: 'var(--radius)',
            padding: '6px 10px',
            color: 'var(--ink)',
            fontSize: 'var(--fs-sm)',
          }}
        />
      </div>

      {/* Nav items with section labels */}
      <nav className="flex-1 overflow-y-auto px-2">
        {(() => {
          let lastSection = '';
          return filtered.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href)) ||
              (item.href === '/' && pathname === '/');
            const showLabel = item.section !== lastSection;
            lastSection = item.section;
            return (
              <div key={item.key}>
                {showLabel && (
                  <div className="px-3 pt-3 pb-1">
                    <span className="font-mono uppercase font-medium"
                      style={{ fontSize: '10px', color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
                      {item.section === 'overview' ? 'Overview' : 'Platform Feeds'}
                    </span>
                  </div>
                )}
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-1.5 font-body text-sm no-underline transition-colors"
                  style={{
                    color: isActive ? 'var(--accent-deep)' : 'var(--ink-soft)',
                    background: isActive ? 'var(--surface-faint)' : 'transparent',
                    borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    borderRadius: 'var(--radius)',
                    fontWeight: isActive ? 500 : 400,
                    textDecoration: 'none',
                  }}
                >
                  <span className="font-mono inline-flex items-center justify-center"
                    style={{ width: 20, fontSize: '11px', color: isActive ? 'var(--accent)' : 'var(--ink-faint)' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </div>
            );
          });
        })()}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-3"
        style={{ borderTop: '1px solid var(--rule)' }}
      >
        <div
          className="font-mono uppercase mb-3"
          style={{
            fontSize: '10px',
            color: 'var(--ink-faint)',
            letterSpacing: '0.06em',
          }}
        >
          Last synced: {lastSynced}
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/digest"
            className="flex items-center justify-center gap-1.5 font-mono uppercase text-center py-2 no-underline"
            style={{
              fontSize: '11px',
              letterSpacing: '0.06em',
              background: 'var(--ink)',
              color: 'var(--paper)',
              borderRadius: 'var(--radius)',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <span>✦</span> AI Digest
          </Link>
          <button
            type="button"
            className="font-mono uppercase py-2 cursor-pointer"
            style={{
              fontSize: '11px',
              letterSpacing: '0.06em',
              background: 'transparent',
              color: 'var(--ink-soft)',
              border: '1px solid var(--rule)',
              borderRadius: 'var(--radius)',
              fontWeight: 500,
            }}
          >
            Sync Data
          </button>
        </div>
      </div>
    </aside>
  );
}
