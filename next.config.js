/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { dev, isServer }) => {
    // Disable webpack cache in development to prevent caching errors
    if (dev && isServer) {
      config.cache = false;
    }
    return config;
  }
};

module.exports = nextConfig;