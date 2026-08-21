import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://beaconcapital.site";

export const metadata: Metadata = {
  title: "Contact Us – Beacon Capital | Phone, Email & Support",
  description:
    "Get in touch with Beacon Capital. Call +1 (512) 375-2360 or email support@beaconcapital.site for institutional advisory, account support, and partnership inquiries.",
  keywords: [
    "Beacon Capital contact",
    "Beacon Capital phone number",
    "Beacon Capital email",
    "Beacon Capital support",
    "institutional advisory contact",
    "asset management support",
    "contact Beacon Capital",
  ],
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: "Contact Beacon Capital – Phone, Email & Support",
    description:
      "Reach Beacon Capital at +1 (512) 375-2360 or support@beaconcapital.site. We provide institutional advisory, capital placement, and platform support.",
    url: `${siteUrl}/contact`,
    siteName: "Beacon Capital",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Beacon Capital – Phone, Email & Support",
    description:
      "Call +1 (512) 375-2360 or email support@beaconcapital.site for institutional advisory and support.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Beacon Capital",
    url: `${siteUrl}/contact`,
    description:
      "Contact Beacon Capital for institutional advisory, account support, and partnership inquiries.",
    mainEntity: {
      "@type": "Organization",
      name: "Beacon Capital",
      url: siteUrl,
      logo: `${siteUrl}/favicon.ico`,
      telephone: "+1-512-375-2360",
      email: "support@beaconcapital.site",
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+1-512-375-2360",
          email: "support@beaconcapital.site",
          contactType: "customer support",
          availableLanguage: ["English"],
          areaServed: "US",
        },
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "Beacon Capital Plaza, 100 Financial District",
        addressLocality: "New York",
        addressRegion: "NY",
        postalCode: "10005",
        addressCountry: "US",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      {children}
    </>
  );
}
