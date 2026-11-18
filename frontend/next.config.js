const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: process.env.APP_BASE_URL
    ? [process.env.APP_BASE_URL.replace(/https?:\/\//, "")]
    : [],
  experimental: {
    // Com o middleware ligado o Next guarda o corpo da requisição em memória e corta em 10 MB: vídeo de 10 a 25 MB
    // chegava incompleto na server action e falhava. Acompanha o limite acima.
    proxyClientMaxBodySize: "30mb",
    // Criador de Sites: upload de imagens (imagens até 8 MB, vídeos de anúncio até 25 MB) e save do site inteiro passam por server actions.
    serverActions: { bodySizeLimit: "30mb" },
    useCache: false,
    workerThreads: false,
  },
  // Miniaturas pré-geradas da galeria: o endereço leva `?v=<hash>`, então muda quando a imagem muda.
  async headers() {
    return [
      {
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
        source: "/template-thumbs/:path*",
      },
    ];
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
