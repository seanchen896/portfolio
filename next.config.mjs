/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: { "/*": ["./content/*.json"] },
  // A production build must not overwrite the running editor's development chunks.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  devIndicators: { buildActivity: false, appIsrStatus: false },
};

export default nextConfig;
