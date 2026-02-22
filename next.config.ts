import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker/self-hosted deployments
  // Vercel handles this automatically, so it's safe to keep
  output: "standalone",
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  reactStrictMode: false,
  
  // Enable experimental features if needed
  experimental: {
    // Enable optimizations
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
