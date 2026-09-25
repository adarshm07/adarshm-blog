/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // next/image refuses any remote host that is not listed here. The profile
    // photo comes from GitHub: the API returns an avatars.githubusercontent.com
    // URL, and github.com/<user>.png is the stable fallback.
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'github.com', pathname: '/*.png' },
    ],
  },
}

export default nextConfig
