import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath:
    process.env.NODE_ENV === "production" ? "/BlazeBlack2ReduxWiki" : "",
  assetPrefix:
    process.env.NODE_ENV === "production" ? "/BlazeBlack2ReduxWiki/" : "",
};

export default nextConfig;
