/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    useCache: false,
    workerThreads: false,
  },
  images: {
    remotePatterns: [
      {
        hostname: "i.pravatar.cc",
        protocol: "https",
      },
      {
        hostname: "atlashosting.com.br",
        protocol: "https",
      },
      {
        hostname: "www.atlashosting.com.br",
        protocol: "https",
      },
    ],
    unoptimized: true,
  },
  output: "standalone",
  serverExternalPackages: ["pg", "pg-native"],
  turbopack: {
    rules: {
      "*.svg": {
        as: "*.js",
        loaders: ["@svgr/webpack"],
      },
    },
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

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
