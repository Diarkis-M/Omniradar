from collectors.reddit_public_collector import get_reddit_trends

posts = get_reddit_trends(['IndianSkincareAddicts', 'SkincareAddiction', 'MakeupAddiction'])
print(f"\nSUCCESS: {len(posts)} posts collected\n")
for p in posts[:5]:
    print(f"  [{p['score']} upvotes | r/{p['subreddit']}] {p['title'][:90]}")
