/** @type {import("next").NextConfig} */

const nextConfig = {
  basePath: "/",
  experimental: {
    serverActions: true,
  },
  pageExtensions: ["ts", "tsx", "js", "jsx", "mdx"],
};

export default nextConfig;
