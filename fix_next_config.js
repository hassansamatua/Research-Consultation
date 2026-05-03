const fs = require('fs');
const path = require('path');

// Fix Next.js configuration for Windows
console.log('🔧 Fixing Next.js configuration...');

const nextConfigPath = path.join(__dirname, 'next.config.js');
const nextConfigTsPath = path.join(__dirname, 'next.config.ts');

// Read current config
let configContent = '';
if (fs.existsSync(nextConfigPath)) {
  configContent = fs.readFileSync(nextConfigPath, 'utf8');
} else if (fs.existsSync(nextConfigTsPath)) {
  configContent = fs.readFileSync(nextConfigTsPath, 'utf8');
}

// Create a new, simpler config
const newConfig = `/** @type {import('next').NextConfig} */
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
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  async redirects() {
    return [
      {
        source: '/not-found',
        destination: '/not-found',
        permanent: false,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;`;

// Write the new config
fs.writeFileSync(nextConfigPath, newConfig);
console.log('✅ Next.js configuration updated');

// Also create a TypeScript version
const tsConfig = `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  async redirects() {
    return [
      {
        source: '/not-found',
        destination: '/not-found',
        permanent: false,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;`;

fs.writeFileSync(nextConfigTsPath, tsConfig);
console.log('✅ Next.js TypeScript configuration updated');

console.log('🎉 Configuration fixed! Try running npm run dev again.');
