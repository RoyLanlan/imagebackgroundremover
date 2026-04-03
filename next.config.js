/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' https://www.paypal.com https://www.sandbox.paypal.com https://maps.googleapis.com https://maps.gstatic.com https://clients.googleapis.com 'unsafe-inline'",
              "frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com https://js.stripe.com https://hooks.stripe.com",
              "frame-ancestors 'self'",
              "connect-src 'self' https://imagebackgroundremover.christmas https://api.paypal.com https://api.sandbox.paypal.com https://api.stripe.com https://maps.googleapis.com https://maps.gstatic.com",
              "img-src 'self' data: blob: https://*.paypal.com https://*.paypalobjects.com https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://lh3.googleusercontent.com",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
