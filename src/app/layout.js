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
  display: "swap",
  preload: true,
});

const instructionFont = localFont({
  src: "./fonts/Instruction.otf",
  variable: "--font-instruction",
  weight: "100 900",
  display: "swap",
  preload: true,
});

const foundersGrotesk = localFont({
  src: "./fonts/fg-regular.woff2",
  variable: "--font-founders-grotesk",
  weight: "100 900",
  display: "swap",
  preload: true,
});

const foundersGroteskLight = localFont({
  src: "./fonts/fg-light.woff2",
  variable: "--font-founders-grotesk-light",
  weight: "100 400",
  display: "swap",
  preload: false,
});

const headerFont = localFont({
  src: "./fonts/Header.ttf",
  variable: "--font-header",
  weight: "100 900",
  display: "swap",
  preload: true,
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
    yahoo: process.env.YAHOO_SITE_VERIFICATION,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/favicon.ico',
    },
  },
  other: {
    // Bing/Yahoo specific meta tags
    'msapplication-TileColor': '#000000',
    'msapplication-config': '/browserconfig.xml',
    // Yahoo Directory submission
    'yahoo-site-verification': process.env.YAHOO_SITE_VERIFICATION,
    // Brave Search optimization
    'brave-site-verification': process.env.BRAVE_SITE_VERIFICATION,
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
          "alternateName": "Kirill.Agency",
          "url": "https://www.kirill.agency",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.kirill.agency/?q={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          "mainEntity": {
            "@type": "Person",
            "name": "Kirill Ginko",
            "alternateName": ["Kirill", "K. Ginko", "Creative Developer NYC"],
            "jobTitle": ["Creative Developer", "Digital Designer", "Frontend Developer"],
            "url": "https://www.kirill.agency",
            "image": "https://www.kirill.agency/flower.svg",
            "sameAs": [
              "https://www.linkedin.com/in/kirillginko/",
              "https://www.instagram.com/kirillginko/",
              "https://github.com/kirillginko",
              "https://twitter.com/kirillginko"
            ],
            "knowsAbout": [
              "Web Development",
              "UI/UX Design", 
              "React.js",
              "Next.js",
              "Digital Experiences",
              "Frontend Development",
              "Interactive Design",
              "Digital Marketing",
              "JavaScript",
              "GSAP Animation",
              "Creative Technology",
              "P5.js",
              "Generative Art"
            ],
            "worksFor": {
              "@type": "Organization",
              "name": "Kirill.Agency",
              "url": "https://www.kirill.agency",
              "logo": "https://www.kirill.agency/flower.svg"
            },
            "location": {
              "@type": "Place",
              "name": "New York City",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "New York",
                "addressRegion": "NY",
                "addressCountry": "US"
              }
            },
            "hasOccupation": {
              "@type": "Occupation",
              "name": "Creative Developer",
              "occupationLocation": {
                "@type": "City",
                "name": "New York City"
              },
              "skills": [
                "React Development",
                "Next.js",
                "UI Design",
                "Frontend Development",
                "JavaScript",
                "Creative Coding"
              ]
            }
          },
          "description": "Creative developer in New York City creating engaging digital experiences. Specializing in React, Next.js, interactive web development, modern UI design, and digital marketing.",
          "primaryImageOfPage": {
            "@type": "ImageObject",
            "url": "https://www.kirill.agency/flower.svg",
            "name": "Kirill Ginko - Creative Developer",
            "caption": "Creative Developer and Digital Designer"
          },
          "keywords": [
            "creative developer NYC",
            "digital designer New York",
            "React developer",
            "Next.js expert",
            "interactive web design",
            "frontend development",
            "UI/UX designer",
            "creative technologist"
          ]
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
        className={`${instructionFont.variable} ${AustinCyRoman.variable} ${foundersGrotesk.variable} ${foundersGroteskLight.variable} ${headerFont.variable}`}
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
