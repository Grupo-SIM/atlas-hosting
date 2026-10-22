const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: process.env.APP_BASE_URL
    ? [process.env.APP_BASE_URL.replace(/https?:\/\//, "")]
    : [],
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
  // Workspace: o root do monorepo (onde fica node_modules) entra no tracing.
  outputFileTracingRoot: path.join(__dirname, ".."),
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
