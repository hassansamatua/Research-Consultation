/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mysql2']
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
  trailingSlash: false,
  async redirects() {
    return [
      {
        source: '/not-found',
        destination: '/not-found',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig
