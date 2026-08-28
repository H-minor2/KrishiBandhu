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
    return [
      {
        source: '/api/advisory',
        destination: 'http://127.0.0.1:8000/advisory',
      },
      {
        source: '/api/distress',
        destination: 'http://127.0.0.1:8001/distress/predict',
      },
      {
        source: '/api/market',
        destination: 'http://127.0.0.1:8001/market/prices',
      },
    ];
  },
};

module.exports = withPWA(nextConfig);

