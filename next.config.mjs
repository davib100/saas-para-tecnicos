/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    "https://3000-firebase-saas-para-tecnicos-1757616839172.cluster-l2bgochoazbomqgfmlhuvdvgiy.cloudworkstations.dev",
    "https://*.cluster-l2bgochoazbomqgfmlhuvdvgiy.cloudworkstations.dev",
  ],
}

export default nextConfig
