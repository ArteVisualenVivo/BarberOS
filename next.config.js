const nextConfig = {
  turbopack: {},

  webpack: (config) => {
    return config;
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;