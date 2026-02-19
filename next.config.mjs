/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**' // Allow all domains for now, configure properly later
      }
    ]
  },
  async rewrites() {
    return [];
  },
};

export default nextConfig;
