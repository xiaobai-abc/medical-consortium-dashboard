/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // allowedDevOrigins: ["192.168.110.36"],
  poweredByHeader: false,
  reactStrictMode: false,
  // experimental: {
  //   optimizePackageImports: ["@antv/l7", "@antv/l7-maps", "echarts"]
  // },
  // turbopack: {
  //   resolveAlias: {
  //     "@antv/l7-component": "./src/lib/l7/l7-component-shim.js"
  //   }
  // }
};

export default nextConfig;
