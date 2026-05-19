'use client';
import { useState } from 'react';
import { getSeedData, getSignalsByPlatform, getCompetitorSignals } from '@/lib/data';
import FeedGrid from '@/components/FeedGrid';
import DetailDrawer from '@/components/DetailDrawer';

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

  return (
    <>
      <FeedGrid signals={signals} title={meta.title} onSelectSignal={setSelected} />
      <DetailDrawer signal={selected} onClose={() => setSelected(null)} />
    </>
  );
}
