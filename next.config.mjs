/** @type {import("next").NextConfig} */

const nextConfig = {
  basePath: "/fatgpt",
  experimental: {
    serverActions: true,
  },
  pageExtensions: ["ts", "tsx", "js", "jsx", "mdx"],
};

export default nextConfig;
