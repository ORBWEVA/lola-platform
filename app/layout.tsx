import type { Metadata } from "next";
import { Exo_2, Space_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lola-platform.vercel.app'),
  title: "LoLA — AI Avatars That Coach, Sell & Grow",
  description: "Build a photorealistic AI avatar that posts to social media and has real-time voice conversations with anyone who clicks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var t = localStorage.getItem('lola-theme');
            if (t === 'light' || t === 'dark') {
              document.documentElement.setAttribute('data-theme', t);
            }
          })();
        `}} />
      </head>
      <body
        className={`${exo2.variable} ${spaceMono.variable} ${notoSansJP.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
