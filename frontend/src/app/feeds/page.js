'use client';
import { useState } from 'react';
import { getSeedData, getAllSignals } from '@/lib/data';
import FeedGrid from '@/components/FeedGrid';
import DetailDrawer from '@/components/DetailDrawer';

export default function FeedsPage() {
  const data = getSeedData();
  const signals = getAllSignals(data);
  const [selected, setSelected] = useState(null);

  return (
    <>
      <FeedGrid signals={signals} title="All Feed" onSelectSignal={setSelected} />
      <DetailDrawer signal={selected} onClose={() => setSelected(null)} />
    </>
  );
}
