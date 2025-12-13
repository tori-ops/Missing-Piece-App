/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint inline style warnings during builds
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
