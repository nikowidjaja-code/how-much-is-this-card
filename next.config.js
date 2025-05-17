// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
      experimental: {
            serverActions: true,
      },
      // Ensure API routes are properly handled in production
      output: 'standalone',
};

module.exports = nextConfig;