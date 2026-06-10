import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['rmkmqafgjbpisopuaxle.supabase.co'],
  },
};
export default nextConfig;
