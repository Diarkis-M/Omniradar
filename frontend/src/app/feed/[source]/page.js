import FeedPageClient from './FeedPageClient';

const SOURCES = ['google', 'reddit', 'pinterest', 'news', 'amazon', 'nykaa', 'flipkart', 'twitter', 'instagram', 'competitors'];

export function generateStaticParams() {
  return SOURCES.map(source => ({ source }));
}

export default function SourceFeedPage({ params }) {
  return <FeedPageClient source={params.source} />;
}
