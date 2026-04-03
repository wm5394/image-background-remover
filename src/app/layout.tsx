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
  metadataBase: new URL("https://image-background-remover.vercel.app"),
  title: {
    default: "Remove Background from Images Online Free | Image Background Remover",
    template: "%s | Image Background Remover",
  },
  description:
    "Remove image backgrounds online in seconds. Upload your photo and download a transparent PNG instantly.",
  keywords: [
    "image background remover",
    "remove background online",
    "transparent png",
    "remove image background",
    "background remover tool",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Remove Background from Images Online Free",
    description:
      "Upload your image, remove the background, and download a transparent PNG in seconds.",
    url: "https://image-background-remover.vercel.app",
    siteName: "Image Background Remover",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remove Background from Images Online Free",
    description:
      "Upload your image, remove the background, and download a transparent PNG in seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-slate-950">{children}</body>
    </html>
  );
}
