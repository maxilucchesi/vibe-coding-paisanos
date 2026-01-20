/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Desactivar la caché de datos para asegurar que siempre se obtengan datos frescos
    workerThreads: false,
    cpus: 1
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  }
}

export default nextConfig
