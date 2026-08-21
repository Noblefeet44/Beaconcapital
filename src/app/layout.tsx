import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800", "900"],
  variable: "--font-work-sans",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://beaconcapital.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Beacon Capital - Secure Mobile Banking & Institutional Asset Portal",
    template: "%s | Beacon Capital",
  },
  description:
    "Beacon Capital provides premium secure mobile banking, real-time capital transfers, and ledger reconciliation for institutional assets.",
  keywords: [
    "Beacon Capital",
    "Mobile Banking",
    "Institutional Asset Management",
    "Secure Financial Portal",
    "Ledger Reconciliation",
    "Digital Capital Management",
    "Encrypted Banking Portal",
  ],
  authors: [{ name: "Beacon Capital Team" }],
  creator: "Beacon Capital",
  publisher: "Beacon Capital",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Beacon Capital - Secure Mobile Banking & Institutional Asset Portal",
    description:
      "Experience next-generation mobile banking, instant transfers, and institutional asset management with 256-bit encryption.",
    url: siteUrl,
    siteName: "Beacon Capital",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beacon Capital - Secure Mobile Banking",
    description:
      "Experience next-generation mobile banking and institutional asset management.",
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
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google868db7a67b886e9f",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: "Beacon Capital",
    url: siteUrl,
    logo: `${siteUrl}/favicon.ico`,
    description:
      "Beacon Capital provides premium secure mobile banking and ledger reconciliation for institutional assets.",
    serviceType: [
      "Mobile Banking",
      "Asset Reconciliation",
      "Institutional Capital Management",
    ],
    telephone: "+1-512-375-2360",
    email: "support@beaconcapital.site",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-512-375-2360",
      email: "support@beaconcapital.site",
      contactType: "customer support",
      availableLanguage: ["English"],
      areaServed: "US",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Beacon Capital Plaza, 100 Financial District",
      addressLocality: "New York",
      addressRegion: "NY",
      postalCode: "10005",
      addressCountry: "US",
    },
    provider: {
      "@type": "Organization",
      name: "Beacon Capital Inc.",
    },
  };

  return (
    <html lang="en" className={`${workSans.variable} light h-full`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-on-background antialiased">
        {children}
      </body>
    </html>
  );
}

