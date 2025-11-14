import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@grc/database", "@grc/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;
