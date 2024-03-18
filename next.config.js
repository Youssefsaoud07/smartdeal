/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['mongoose']
  },
  images: {
    domains: ['m.media-amazon.com', 'tn.jumia.is', 'www.google.com']
  }
}

module.exports = nextConfig
