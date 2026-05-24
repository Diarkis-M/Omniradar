import ClusterBriefClient from './ClusterBriefClient';

const CLUSTERS = [
  'personal-wash',
  'hair-care',
  'mens-grooming',
  'home-insecticides',
  'air-fresheners',
  'sexual-wellness',
  'fabric-care',
];

export function generateStaticParams() {
  return CLUSTERS.map((cluster) => ({ cluster }));
}

export default function ClusterBriefPage({ params }) {
  return <ClusterBriefClient cluster={params.cluster} />;
}
