/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    position: "bottom-right",
  },
  experimental: {
    optimizePackageImports: ["@antv/l7", "@antv/l7-maps", "echarts"],
  },
};

export default nextConfig;
