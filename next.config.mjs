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
  async headers() {
    return [
      {
        // a-p-i, _next/static, _next/image, assets, favicon.ico
        source: '/:path*',
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS, PATCH, DELETE, POST, PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
  },
  // A configuração abaixo pode não estar funcionando como esperado,
  // então a abordagem de headers() acima é mais explícita.
  // Manteremos por enquanto, para referência.
  allowedDevOrigins: [
    "https://3000-firebase-saas-para-tecnicos-1757616839172.cluster-l2bgochoazbomqgfmlhuvdvgiy.cloudworkstations.dev",
    "https://*.cluster-l2bgochoazbomqgfmlhuvdvgiy.cloudworkstations.dev",
  ],
}

export default nextConfig
