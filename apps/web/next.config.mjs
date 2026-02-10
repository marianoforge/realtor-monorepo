import { withSentryConfig } from "@sentry/nextjs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, "..", "..");
dotenv.config({ path: path.join(rootDir, ".env") });
dotenv.config({ path: path.join(rootDir, ".env.local") });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@gds-si/shared-types",
    "@gds-si/shared-utils",
    "@gds-si/shared-schemas",
    "@gds-si/shared-stores",
    "@gds-si/shared-api",
    "@gds-si/shared-hooks",
  ],
  // Remove console.log in production
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"], // Keep console.error and console.warn
          }
        : false,
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
        ],
      },
    ];
  },
  reactStrictMode: true,
  // Exclude functions directory from Next.js compilation
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        "**/functions/**",
        "**/node_modules/**",
        "**/scripts/**",
        "**/.nx/**",
      ],
    };

    // Configure path aliases for webpack
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
      "@gds-si/shared-types": path.resolve(__dirname, "../../libs/shared-types/src"),
      "@gds-si/shared-utils": path.resolve(__dirname, "../../libs/shared-utils/src"),
      "@gds-si/shared-schemas": path.resolve(__dirname, "../../libs/shared-schemas/src"),
      "@gds-si/shared-schemas/": path.resolve(__dirname, "../../libs/shared-schemas/src/"),
      "@gds-si/shared-stores": path.resolve(__dirname, "../../libs/shared-stores/src"),
      "@gds-si/shared-api": path.resolve(__dirname, "../../libs/shared-api/src"),
      "@gds-si/shared-hooks": path.resolve(__dirname, "../../libs/shared-hooks/src"),
    };

    // Fix for XLSX and other Node.js modules in server-side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        xlsx: "commonjs xlsx",
      });
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tailwindui.com",
        port: "",
        pathname: "/img/logos/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: "/dashboard",
  //       destination: "/tracker/dashboard",
  //     },
  //     {
  //       source: "/agents",
  //       destination: "/tracker/agents",
  //     },
  //     {
  //       source: "/calendar",
  //       destination: "/tracker/calendar",
  //     },
  //     {
  //       source: "/eventForm",
  //       destination: "/tracker/eventForm",
  //     },
  //     {
  //       source: "/expenses",
  //       destination: "/tracker/expenses",
  //     },
  //     {
  //       source: "/expensesBroker",
  //       destination: "/tracker/expensesBroker",
  //     },
  //     {
  //       source: "/expensesList",
  //       destination: "/tracker/expensesList",
  //     },
  //     {
  //       source: "/operationsList",
  //       destination: "/tracker/operationsList",
  //     },
  //     {
  //       source: "/reservationInput",
  //       destination: "/tracker/reservationInput",
  //     },
  //     {
  //       source: "/settings",
  //       destination: "/tracker/settings",
  //     },
  //     {
  //       source: "/reset-password",
  //       destination: "/reset-password",
  //     },
  //     {
  //       source: "/checkout",
  //       destination: "/site/checkout/checkout",
  //     },
  //   ];
  // },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "realtor-trackpro",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
