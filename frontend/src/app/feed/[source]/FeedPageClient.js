'use client';
import { useState } from 'react';
import { getSeedData, getSignalsByPlatform, getCompetitorSignals, isBeautyRelated } from '@/lib/data';
import FeedGrid from '@/components/FeedGrid';
import DetailDrawer from '@/components/DetailDrawer';

// Platforms whose pipeline already searches for beauty terms — no filter needed
const BEAUTY_SCOPED = new Set(['reddit', 'amazon', 'nykaa', 'flipkart', 'instagram', 'competitors']);

const SOURCE_META = {
  google:     { title: 'Google Feed',     key: 'google' },
  reddit:     { title: 'Reddit Feed',     key: 'reddit' },
  pinterest:  { title: 'Pinterest Feed',  key: 'pinterest' },
  news:       { title: 'News Feed',       key: 'rss' },
  amazon:     { title: 'Amazon Feed',     key: 'amazon' },
  nykaa:      { title: 'Nykaa Feed',      key: 'nykaa' },
  flipkart:   { title: 'Flipkart Feed',   key: 'flipkart' },
  twitter:    { title: 'Twitter Feed',    key: 'social' },
  instagram:  { title: 'Instagram Feed',  key: 'instagram' },
  competitors:{ title: 'Competitor Feed', key: 'competitors' },
};

export default function FeedPageClient({ source }) {
  const data = getSeedData();
  const [selected, setSelected] = useState(null);

  const meta = SOURCE_META[source] || { title: `${source} Feed`, key: source };

  let signals;
  if (source === 'competitors') {
    signals = getCompetitorSignals(data);
  } else {
    signals = getSignalsByPlatform(data, meta.key);
  }

  // Filter non-beauty signals for platforms that pull general trends
  if (!BEAUTY_SCOPED.has(source)) {
    signals = signals.filter(isBeautyRelated);
  }

  return (
    <>
      <FeedGrid signals={signals} title={meta.title} onSelectSignal={setSelected} />
      <DetailDrawer signal={selected} onClose={() => setSelected(null)} />
    </>
  );
}
