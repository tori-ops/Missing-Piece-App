/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint warnings during builds (we use inline styles throughout the app)
    ignoreDuringBuilds: true,
  },
  // Ignore specific ESLint rules
  typescript: {
    ignoreBuildErrors: false,
  }
};

module.exports = nextConfig;
