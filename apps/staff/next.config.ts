import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@kosmetika/ui", "@kosmetika/types", "@kosmetika/auth"],
};

export default nextConfig;
