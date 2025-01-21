/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://kirill.agency",
  generateRobotsTxt: true, // generates robots.txt
  sitemapSize: 7000,
  changefreq: "daily",
  priority: 0.7,
  exclude: ["/admin/*", "/private/*"], // Add any URLs you want to exclude
  robotsTxtOptions: {
    additionalSitemaps: [
      // Add any additional sitemaps here if needed
    ],
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/private", "/admin"], // Add paths you want to disallow
      },
    ],
  },
};
