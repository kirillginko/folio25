import { Providers } from "./providers";
import localFont from "next/font/local";
import "./globals.css";
import { GlobalStateProvider } from "./context/GlobalStateContext";
import GlobalBackdrop from "./components/GlobalBackdrop";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";

const AustinCyRoman = localFont({
  src: "./fonts/AustinCy-Roman.woff2",
  variable: "--font-austin-cy-roman",
  weight: "100 900",
});

const instructionFont = localFont({
  src: "./fonts/Instruction.otf",
  variable: "--font-instruction",
  weight: "100 900",
});

export const metadata = {
  title: "Kirill Ginko | Creative Developer & Digital Designer in NYC",
  description:
    "Kirill Ginko is a creative developer and digital designer based in New York City, specializing in crafting engaging and high-performance web experiences. With expertise in modern ux/ui design, branding and digital marketing, I focus on developing interactive and user-centered applications. My passion lies in transforming ideas into functional and visually appealing digital solutions for businesses and individuals.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : new URL("https://www.kirill.agency"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "creative developer",
    "digital designer",
    "NYC developer",
    "React developer",
    "Next.js expert",
    "UI designer New York",
    "interactive experiences",
    "web animation",
    "Kirill Ginko",
    "digital experiences",
    "creative technologist",
    "modern web development",
    "UI/UX design",
    "frontend development",
    "New York City developer",
  ],
  creator: "Kirill Ginko",
  authors: [{ name: "Kirill Ginko", url: "https://www.kirill.agency" }],
  publisher: "Kirill Ginko",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Kirill Ginko | Creative Developer & Digital Designer in NYC",
    description:
      "Kirill Ginko is a creative developer and digital designer based in New York City, specializing in crafting engaging and high-performance web experiences. With expertise in modern ux/ui design, branding and digital marketing, I focus on developing interactive and user-centered applications. My passion lies in transforming ideas into functional and visually appealing digital solutions for businesses and individuals.",
    url: "https://www.kirill.agency",
    siteName: "Kirill Ginko",
    images: [
      {
        url: "/flower.svg",
        width: 1200,
        height: 630,
        alt: "Kirill Ginko - Creative Developer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kirill Ginko | Creative Developer & Digital Designer",
    description:
      "Kirill Ginko is a creative developer and digital designer based in New York City, specializing in crafting engaging and high-performance web experiences. With expertise in modern ux/ui design, branding and digital marketing, I focus on developing interactive and user-centered applications. My passion lies in transforming ideas into functional and visually appealing digital solutions for businesses and individuals.",
    url: "https://www.kirill.agency",
    images: ["/flower.svg"],
    creator: "@kirillginko",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    bing: process.env.BING_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <Script id="schema-markup" type="application/ld+json">
          {`
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": ["WebSite", "ProfilePage"],
          "name": "Kirill Ginko - Official Portfolio",
          "url": "https://www.kirill.agency",
          "mainEntity": {
            "@type": "Person",
            "name": "Kirill Ginko",
            "jobTitle": "Creative Developer",
            "url": "https://www.kirill.agency",
            "sameAs": [
              "https://www.linkedin.com/in/kirillginko/",
              "https://www.instagram.com/kirillginko/",
              "https://github.com/kirillginko"
            ],
            "knowsAbout": [
              "Web Development",
              "UI Design",
              "React",
              "Next.js",
              "Digital Experiences",
              "Frontend Development",
              "Interactive Design",
              "Digital Marketing"
            ],
            "worksFor": {
              "@type": "Organization",
              "name": "Kirill.Agency",
              "url": "https://www.kirill.agency"
            },
            "location": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "New York",
                "addressRegion": "NY",
                "addressCountry": "US"
              }
            }
          },
            "description": "Creative developer in New York City creating engaging digital experiences. Specializing in React, Next.js, interactive web development, modern UI design, and digital marketing.",
            "primaryImageOfPage": {
            "@type": "ImageObject",
            "url": "https://www.kirill.agency/flower.svg",
            "name": "Kirill Ginko - Creative Developer"
          }
        },
        {
          "@type": "ProfessionalService",
          "name": "Kirill Ginko Creative Development",
          "image": "https://www.kirill.agency/flower.svg",
          "description": "Kirill Ginko is a creative developer and digital designer based in New York City, specializing in crafting engaging and high-performance web experiences. With expertise in modern ux/ui design, branding and digital marketing, I focus on developing interactive and user-centered applications. My passion lies in transforming ideas into functional and visually appealing digital solutions for businesses and individuals.",
          "@id": "https://www.kirill.agency",
          "url": "https://www.kirill.agency",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "New York",
            "addressRegion": "NY",
            "addressCountry": "US"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "40.7128",
            "longitude": "-74.0060"
          },
          "areaServed": {
            "@type": "City",
            "name": "New York City"
          },
          "priceRange": "$$",
          "sameAs": [
            "https://github.com/kirillginko",
            "https://www.linkedin.com/in/kirillginko/"
          ],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Creative Development Services",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Web Development",
                  "description": "Custom web development using React and Next.js"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "UI Design",
                  "description": "Modern UI design and interactive experiences"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Digital Marketing",
                  "description": "Digital marketing and brand development"
                }
              }
            ]
          }
        }
      ]
    }
  `}
        </Script>
      </head>
      <body
        className={`${instructionFont.variable} ${AustinCyRoman.variable}`}
        suppressHydrationWarning
      >
        <GlobalStateProvider>
          <GlobalBackdrop />
          <Providers>{children}</Providers>
          <Analytics mode="production" />
        </GlobalStateProvider>
      </body>
    </html>
  );
}
