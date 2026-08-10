import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagen Docker mínima: Next copia solo lo necesario a .next/standalone.
  output: 'standalone',
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['framer-motion', 'gsap'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
