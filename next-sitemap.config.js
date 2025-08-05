/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.kirill.agency",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: "weekly",
  priority: 0.8,
  exclude: ["/api/*", "/_next/*", "/private/*"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/private/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        crawlDelay: 1,
      },
      {
        userAgent: "Bingbot", 
        allow: "/",
        crawlDelay: 1,
      },
    ],
  },
};
