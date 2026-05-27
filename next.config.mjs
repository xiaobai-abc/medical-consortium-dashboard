/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  /**
   * Next 16 开发环境会拦截跨源 dev 资源请求。
   * 局域网访问当前机器时，需要把实际访问的主机名/IP 加进 allowlist，
   * 否则 HMR websocket 和其他 dev-only 资源会被拒掉。
   */
  allowedDevOrigins: ["192.168.110.33"],
  poweredByHeader: false,
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }, // 允许所有 https 域名（或指定）
      { protocol: "http", hostname: "localhost" }
    ],
    formats: ["image/avif", "image/webp"], // 优先 AVIF/WebP
    minimumCacheTTL: 60 // 缓存 60s
  },
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
