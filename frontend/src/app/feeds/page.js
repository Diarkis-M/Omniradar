'use client';
import { useState } from 'react';
import { getSeedData, getAllSignals, isBeautyRelated } from '@/lib/data';
import FeedGrid from '@/components/FeedGrid';
import DetailDrawer from '@/components/DetailDrawer';

export default function FeedsPage() {
  const data = getSeedData();
  const signals = getAllSignals(data).filter(isBeautyRelated);
  const [selected, setSelected] = useState(null);

  return (
    <>
      <FeedGrid signals={signals} title="All Feed" onSelectSignal={setSelected} />
      <DetailDrawer signal={selected} onClose={() => setSelected(null)} />
    </>
  );
}
