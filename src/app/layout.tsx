import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "README Showcase - Turn GitHub README into Beautiful Pages",
  description: "Transform GitHub README files into beautiful, shareable web pages instantly. Free tool for developers.",
  keywords: ["GitHub", "README", "showcase", "developer tool", "portfolio"],
  authors: [{ name: "opesli" }],
  openGraph: {
    title: "README Showcase - Turn GitHub README into Beautiful Pages",
    description: "Transform GitHub README files into beautiful, shareable web pages instantly. Free tool for developers.",
    url: "https://opesli124.github.io/readme-showcase/",
    siteName: "README Showcase",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "README Showcase",
    description: "Turn any GitHub README into a beautiful webpage in seconds",
    creator: "@opesli",
  },
  metadataBase: new URL("https://opesli124.github.io/readme-showcase/"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
