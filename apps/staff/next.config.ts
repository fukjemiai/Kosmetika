import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@kosmetika/ui", "@kosmetika/types", "@kosmetika/auth"],
};

export default nextConfig;
