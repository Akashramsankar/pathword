// app/layout.tsx

import Script from 'next/script'; // Import the Script component
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Assuming these are correct font imports
import "./globals.css";

const geistSans = Geist({ // Assuming Geist is a function that returns font configuration
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({ // Assuming Geist_Mono is a function
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- Google Analytics Configuration ---
// Replace G-YOUR_MEASUREMENT_ID with your actual Google Analytics Measurement ID
// It's best to use an environment variable for this, e.g., process.env.NEXT_PUBLIC_GA_ID
const GA_MEASUREMENT_ID ='G-5JXQDVYBK3';
//const GA_MEASUREMENT_ID ='';
const siteUrl ='https://www.pathword.co'; // Your site URL

// --- Metadata Configuration (including Open Graph and Twitter Cards) ---
export const metadata: Metadata = {
  // --- Basic Metadata ---
  title: 'Pathword - Daily Word Puzzle',
  description: 'Navigate the grid, find the hidden word! A new Pathword puzzle daily.',

  // --- Open Graph Metadata ---
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Pathword - Daily Word Puzzle Game',
    description: 'Challenge yourself with today\'s Pathword! Can you find the hidden word?',
    siteName: 'Pathword',
    images: [
      {
        url: `${siteUrl}/images/og-image.png`, // Create this image in public/images/
        width: 1158,
        height: 1462,
        alt: 'Pathword Game Board Preview',
      },
    ],
    locale: 'en_US',
  },

  // --- Twitter Card Metadata ---
  twitter: {
    card: 'summary_large_image',
    title: 'Pathword - Daily Word Puzzle Game',
    description: 'Navigate the grid daily to find the hidden Pathword!',
    images: [`${siteUrl}/images/og-image2.png`], // Uses same image as Open Graph
  },
   // If you want to ensure relative paths in metadata are resolved correctly,
   // especially if not using full URLs for images (though full URLs are safer for OG/Twitter).
   // metadataBase: new URL(siteUrl),
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
              id="google-analytics-init" // Added a more specific ID
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
