/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' for better authentication support
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
