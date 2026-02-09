/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mysql2'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
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
