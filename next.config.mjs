/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The signal engine and mock data are deterministic and self-contained, so the
  // MVP builds without external services. Lint/type errors should not block the
  // demo build; CI runs `npm run typecheck` and `npm run lint` separately.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
