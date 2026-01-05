/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint inline style warnings during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript type checking during build
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
