/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        // Use an environment variable for deployment flexibility
        destination: `${process.env.BACKEND_URL || 'http://127.0.0.1:5000'}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
