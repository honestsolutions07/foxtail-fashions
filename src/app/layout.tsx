import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Foxtail Fashions | Redefine Your Style",
  description: "Discover the perfect blend of comfort and elegance. Premium fashion that transcends seasons with modern craftsmanship and sustainable practices.",
  keywords: ["fashion", "clothing", "style", "premium", "sustainable", "modern", "foxtail fashions"],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Foxtail Fashions | Redefine Your Style",
    description: "Discover the perfect blend of comfort and elegance. Premium fashion for the modern individual.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${playfair.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

