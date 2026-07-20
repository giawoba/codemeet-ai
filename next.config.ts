import type { NextConfig } from "next";

// DEPLOY_TARGET=gh-pages 時輸出靜態站並掛上 GitHub Pages 的子路徑
const isGithubPages = process.env.DEPLOY_TARGET === "gh-pages";

const nextConfig: NextConfig = {
  output: isGithubPages ? "export" : undefined,
  basePath: isGithubPages ? "/meetadream-ai" : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
