import { Providers } from "./providers";
import localFont from "next/font/local";
import "./globals.css";
import { GlobalStateProvider } from "./context/GlobalStateContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const ABCDiatype = localFont({
  src: "./fonts/ABCDiatype-Medium.woff2",
  variable: "--font-abc-diatype",
  weight: "100 900",
});

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
  title: "Kirill Ginko | Creative Developer",
  description: "Kirill Ginko is a creative developer based in New York.",
};

export default function RootLayout({ children }) {
  return (
    <GlobalStateProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${instructionFont.variable} ${AustinCyRoman.variable} ${ABCDiatype.variable}`}
          suppressHydrationWarning
        >
          <Providers>{children}</Providers>
        </body>
      </html>
    </GlobalStateProvider>
  );
}
