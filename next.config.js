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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.paypal.com https://www.paypal.com https://www.sandbox.paypal.com https://maps.googleapis.com https://maps.gstatic.com https://clients.googleapis.com",
              "frame-src 'self' https://*.paypal.com https://www.paypal.com https://www.sandbox.paypal.com https://js.stripe.com https://hooks.stripe.com",
              "frame-ancestors 'self'",
              "connect-src 'self' https://*.paypal.com https://www.paypal.com https://www.sandbox.paypal.com https://api.paypal.com https://api.sandbox.paypal.com https://api.stripe.com https://maps.googleapis.com https://maps.gstatic.com https://imagebackgroundremover.christmas",
              "img-src 'self' data: blob: https://*.paypal.com https://*.paypalobjects.com https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://lh3.googleusercontent.com",
              "style-src 'self' 'unsafe-inline' https://*.paypal.com",
              "font-src 'self' https://*.paypal.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
