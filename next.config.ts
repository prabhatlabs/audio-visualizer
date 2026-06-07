import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/lyrica/:path*",
        destination: "https://test-0k.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;
