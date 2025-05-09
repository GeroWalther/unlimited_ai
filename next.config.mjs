/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly enable server-side environment variables
  env: {
    REPLICATE_API_KEY: process.env.REPLICATE_API_KEY,
  },
  // Additionally, enable image domains for Replicate and Supabase
  images: {
    domains: ['replicate.delivery', 'gkirkmokykvcsjixddfc.supabase.co'],
  },
};

export default nextConfig;
