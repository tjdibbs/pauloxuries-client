/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // experimental: { esmExternals: true },
  images: {
    domains: ["pauloxuries.com", "api.frutiv.com"],
  }}

module.exports = nextConfig;
