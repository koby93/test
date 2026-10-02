import type { NextConfig } from 'next';
const config: NextConfig = {
  transpilePackages: ['@nita/contracts'],
  poweredByHeader: false,
  experimental: { cpus: 2 },
};
export default config;
