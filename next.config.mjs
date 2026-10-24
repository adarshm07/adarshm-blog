/** @type {import('next').NextConfig} */

// Posts merged into a single guide. Permanent redirects keep old links and
// search rankings pointing at the surviving post.
const mergedPosts = {
  'browser-storage-compared': 'cookies-and-sessions',
  'weakmap-and-weakset': 'javascript-map-and-set',
  'let-const-and-var': 'hoisting-and-the-temporal-dead-zone',
  'quick-sort-and-heap-sort': 'sorting-algorithms-explained',
  'counting-sort-and-radix-sort': 'sorting-algorithms-explained',
  'arrays-vs-linked-lists': 'linked-lists-and-cycle-detection',
};

const nextConfig = {
  async redirects() {
    return Object.entries(mergedPosts).map(([from, to]) => ({
      source: `/blog/${from}`,
      destination: `/blog/${to}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
