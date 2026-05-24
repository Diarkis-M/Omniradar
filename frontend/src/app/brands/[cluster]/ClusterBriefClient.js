'use client';

import Link from 'next/link';
import briefsData from '@/lib/brand_briefs_data.json';

const CLUSTER_META = {
  'personal-wash': { name: 'Personal Wash', brands: 'Cinthol, Godrej No.1, Protekt', icon: '\u{1FAE7}' },
  'hair-care': { name: 'Hair Care', brands: 'Godrej Expert, Nupur, Godrej Professional', icon: '\u{1F487}' },
  'mens-grooming': { name: "Men's Grooming & Fragrances", brands: 'Park Avenue, Cinthol', icon: '\u{1FA92}' },
  'home-insecticides': { name: 'Home Insecticides', brands: 'HIT, Good Knight', icon: '\u{1F6E1}' },
  'air-fresheners': { name: 'Air Fresheners', brands: 'Godrej aer', icon: '\u{1F33F}' },
  'sexual-wellness': { name: 'Sexual Wellness', brands: 'Kamasutra / KS', icon: '♡' },
  'fabric-care': { name: 'Fabric Care', brands: 'Ezee, Genteel', icon: '\u{1F9FA}' },
};

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ClusterBriefClient({ cluster }) {
  const meta = CLUSTER_META[cluster] || { name: cluster, brands: '', icon: '?' };
  const clusterHistory = (briefsData?.clusters?.[cluster]) || [];

  const today = clusterHistory[0]; // Newest first (sorted by date desc)
  const pastDays = clusterHistory.slice(1);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link href="/brands" style={{
          color: 'var(--ink-soft)', fontSize: 'var(--fs-sm)', fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase', letterSpacing: '0.06em', textDecoration: 'none',
        }}>
          &larr; Brand Health
        </Link>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700,
          fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: 'var(--ink)',
          letterSpacing: '-0.02em', margin: '12px 0 4px',
        }}>
          {meta.icon} {meta.name}
        </h1>

        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)',
          color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.06em',
          margin: 0,
        }}>
          {meta.brands}
        </p>
      </div>

      {/* Today's Brief — Hero Card */}
      {today ? (
        <div style={{
          background: 'var(--paper)', border: '2px solid var(--accent)',
          borderRadius: 'var(--radius)', padding: '24px 28px', marginBottom: 32,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 16,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontStyle: 'italic',
              fontSize: 'var(--fs-lg)', color: 'var(--ink)',
            }}>
              Today&apos;s Brief
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)',
              color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {formatDate(today.date)}
            </span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {today.briefs.map((brief, i) => (
              <li key={i} style={{
                padding: '12px 0',
                borderTop: i > 0 ? '1px solid var(--rule)' : 'none',
              }}>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 'var(--fs-base)',
                  color: 'var(--ink)', lineHeight: 1.55, margin: 0,
                }}>
                  {brief.text}
                </p>
                {brief.evidence && (
                  <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)',
                    color: 'var(--ink-faint)', margin: '6px 0 0',
                  }}>
                    Source: {brief.evidence}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={{
          background: 'var(--paper-deep)', borderRadius: 'var(--radius)',
          padding: '32px', textAlign: 'center', marginBottom: 32,
        }}>
          <p style={{
            fontFamily: 'var(--font-body)', color: 'var(--ink-soft)',
            fontSize: 'var(--fs-base)', margin: 0,
          }}>
            No briefs yet. Data will appear after the next pipeline run.
          </p>
        </div>
      )}

      {/* 30-Day Timeline */}
      {pastDays.length > 0 && (
        <div>
          <h2 style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
            color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: 16,
          }}>
            Past 30 Days
          </h2>

          {pastDays.map((day) => (
            <div key={day.date} style={{
              background: 'var(--paper)', border: '1px solid var(--rule)',
              borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 12,
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)',
                color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em',
                marginBottom: 10,
              }}>
                {formatDate(day.date)}
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {day.briefs.map((brief, i) => (
                  <li key={i} style={{
                    padding: '8px 0',
                    borderTop: i > 0 ? '1px solid var(--rule)' : 'none',
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: 'var(--fs-sm)',
                      color: 'var(--ink)', lineHeight: 1.5, margin: 0,
                    }}>
                      {brief.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
