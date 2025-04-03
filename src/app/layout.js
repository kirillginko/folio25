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
    "Creative developer in New York City creating engaging digital experiences. Specializing in React, Next.js, interactive web development, modern UI design, and digital marketing.",
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
      "Creative developer crafting engaging digital experiences with modern web technologies. Based in New York City.",
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
      "Creative developer crafting engaging digital experiences in NYC.",
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
              "@type": "WebSite",
              "name": "Kirill Ginko",
              "url": "https://www.kirill.agency",
              "description": "Creative developer and digital designer crafting engaging web experiences",
              "creator": {
                "@type": "Person",
                "name": "Kirill Ginko",
                "jobTitle": "Creative Developer",
                "url": "https://www.kirill.agency",
                "knowsAbout": ["Web Development", "UI Design", "React", "Next.js", "Digital Experiences"],
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
              "specialty": "Creative Development and Digital Design",
              "potentialAction": {
                "@type": "ViewAction",
                "target": "https://www.kirill.agency"
              }
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
