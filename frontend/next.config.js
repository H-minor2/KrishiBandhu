const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
    
    return [
      {
        source: '/api/advisory',
        destination: `${backendUrl}/advisory`,
      },
      {
        source: '/api/distress',
        destination: `${backendUrl}/distress/predict`,
      },
      {
        source: '/api/market',
        destination: `${backendUrl}/market/prices`,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);

