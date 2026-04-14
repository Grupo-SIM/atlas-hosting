/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'atlashosting.com.br',
      },
      {
        protocol: 'https',
        hostname: 'www.atlashosting.com.br',
      },
    ],
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  // output: "standalone",
  experimental: {
    nodeMiddleware: true,
    useCache: true,
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  // For webpack (when not using turbopack)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/docker-data/**",
          "**/.next/**",
          "**/.git/**",
        ],
      };
    }
    return config;
  },
};

module.exports = nextConfig;
