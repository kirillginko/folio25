import { Providers } from "./providers";
import localFont from "next/font/local";
import "./globals.css";
import { GlobalStateProvider } from "./context/GlobalStateContext";

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
  title: "Kirill Ginko | Creative Developer & Web Designer in New York",
  description:
    "Award-winning creative developer specializing in interactive web experiences, custom web development, and UI design in New York City. Expert in React, Next.js, and modern web technologies.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : new URL("https://www.kirill.agency"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "creative developer NYC",
    "web developer New York",
    "frontend developer NYC",
    "interactive web design",
    "UI/UX designer New York",
    "React developer NYC",
    "Next.js developer",
    "custom web development",
    "interactive websites",
    "Kirill Ginko",
    "digital experiences",
    "web animation specialist",
  ],
  creator: "Kirill Ginko",
  openGraph: {
    title: "Kirill Ginko | Creative Developer",
    description: "Kirill Ginko is a creative developer based in New York.",
    url: "https://www.kirill.agency",
    siteName: "Kirill Ginko Portfolio",
    images: [
      {
        url: "/flower.svg", // Add your OG image
        width: 1200,
        height: 630,
        alt: "Kirill Ginko - Creative Developer Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kirill Ginko | Creative Developer",
    description: "Kirill Ginko is a creative developer based in New York.",
    images: ["/flower.svg"], // Same as OG image
  },
  robots: {
    index: true,
    follow: true,
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
  },
};

export default function RootLayout({ children }) {
  return (
    <GlobalStateProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
        </head>
        <body
          className={`${instructionFont.variable} ${AustinCyRoman.variable}`}
          suppressHydrationWarning
        >
          <Providers>{children}</Providers>
        </body>
      </html>
    </GlobalStateProvider>
  );
}
