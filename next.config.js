/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: { esmExternals: true },
  images: {
    domains: ["pauloxuries.com"],
  },
};

module.exports = nextConfig;
