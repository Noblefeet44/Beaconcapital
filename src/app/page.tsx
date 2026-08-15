import React from "react";
import Metadata from "next";
import Link from "next/link";
import PublicHeader from "@/components/public/Header";
import PublicFooter from "@/components/public/Footer";
import { BLOG_POSTS } from "@/lib/blog-data";

export const metadata = {
  title: "Beacon Capital | Premier Institutional Asset Portal & Secure Banking",
  description:
    "Beacon Capital delivers high-yield private market investments, multi-layer ledger reconciliation, and secure digital banking for institutional investors.",
  alternates: {
    canonical: "https://beaconcapital.site",
  },
  openGraph: {
    title: "Beacon Capital | Premier Institutional Asset Portal & Secure Banking",
    description:
      "Beacon Capital delivers high-yield private market investments, multi-layer ledger reconciliation, and secure digital banking for institutional investors.",
    url: "https://beaconcapital.site",
    siteName: "Beacon Capital",
    locale: "en_US",
    type: "website",
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: "Beacon Capital",
    url: "https://beaconcapital.site",
    logo: "https://beaconcapital.site/favicon.ico",
    description:
      "Beacon Capital provides premier secure banking, high-yield private market investments, and ledger reconciliation for institutional assets.",
    serviceType: [
      "Institutional Asset Management",
      "Private Debt & Equity",
      "Digital Ledger Reconciliation",
      "Corporate Banking Services",
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background antialiased text-on-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-on-primary py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-40"></div>
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
            <div className="max-w-3xl flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white text-xs font-semibold tracking-wider uppercase backdrop-blur-sm self-start">
                <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                Institutional Capital & Banking Platform
              </div>
              <h1 className="font-display-lg text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
                Next-Generation Capital Management & Asset Reconciliation
              </h1>
              <p className="font-body-lg text-lg md:text-xl text-white/90 leading-relaxed font-normal">
                Empowering institutional asset managers, private equity funds, and high-net-worth clients with instant liquidity, 256-bit encrypted ledger auditing, and high-yield credit opportunities.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/investment-opportunities"
                  className="px-8 py-3.5 bg-white text-primary font-bold text-sm hover:bg-surface-container-low transition-colors shadow-md"
                >
                  View Opportunities
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-3.5 border-2 border-white text-white font-bold text-sm hover:bg-white/10 transition-colors"
                >
                  Learn About Beacon
                </Link>
              </div>
            </div>

            {/* Key Metrics Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-white/20">
              <div>
                <div className="text-3xl md:text-4xl font-extrabold text-white">$2.4B+</div>
                <div className="text-xs text-white/80 uppercase font-semibold tracking-wider mt-1">Assets Under Management</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-extrabold text-white">99.99%</div>
                <div className="text-xs text-white/80 uppercase font-semibold tracking-wider mt-1">Ledger Uptime Guarantee</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-extrabold text-white">256-Bit</div>
                <div className="text-xs text-white/80 uppercase font-semibold tracking-wider mt-1">Encrypted Security</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-extrabold text-white">100%</div>
                <div className="text-xs text-white/80 uppercase font-semibold tracking-wider mt-1">Audited Compliance</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Overview Section */}
        <section className="py-20 bg-surface-container-lowest border-b border-surface-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Core Capabilities</span>
                <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-on-background mt-1">
                  Institutional Financial Solutions
                </h2>
              </div>
              <Link href="/services" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                Explore All Services <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-surface-container-low border border-surface-variant flex flex-col gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                </div>
                <h3 className="font-headline-md text-xl font-bold text-on-background">Wealth & Asset Allocation</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Bespoke portfolio management and asset allocation strategies structured for long-term capital preservation and yield optimization.
                </p>
                <Link href="/services" className="text-primary font-bold text-sm hover:underline mt-auto pt-4 inline-flex items-center gap-1">
                  Learn More <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Link>
              </div>

              <div className="p-8 bg-surface-container-low border border-surface-variant flex flex-col gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">receipt_long</span>
                </div>
                <h3 className="font-headline-md text-xl font-bold text-on-background">Digital Ledger Reconciliation</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Real-time cryptographic audit trails for fund transactions, multi-layer transfers, and corporate treasury management.
                </p>
                <Link href="/services" className="text-primary font-bold text-sm hover:underline mt-auto pt-4 inline-flex items-center gap-1">
                  Learn More <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Link>
              </div>

              <div className="p-8 bg-surface-container-low border border-surface-variant flex flex-col gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">trending_up</span>
                </div>
                <h3 className="font-headline-md text-xl font-bold text-on-background">Private Credit & Direct Debt</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Access high-yield senior secured lending opportunities collateralized by commercial infrastructure and enterprise liquidity.
                </p>
                <Link href="/services" className="text-primary font-bold text-sm hover:underline mt-auto pt-4 inline-flex items-center gap-1">
                  Learn More <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Investment Opportunities Section */}
        <section className="py-20 bg-background">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="bg-primary-container text-on-primary-container p-10 md:p-14 mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl flex flex-col gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white/90">Exclusive Placement</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  Private Credit & Infrastructure Yield Fund II
                </h2>
                <p className="text-white/90 text-sm md:text-base leading-relaxed">
                  Targeting 11.8% net annual yields with monthly cash distribution, backed by senior-secured commercial debt covenants.
                </p>
              </div>
              <Link
                href="/investment-opportunities"
                className="px-6 py-3.5 bg-white text-primary font-bold text-sm whitespace-nowrap hover:bg-surface-container-low transition-colors shadow-md"
              >
                Review Fund Prospectus
              </Link>
            </div>
          </div>
        </section>

        {/* Blog / Articles Preview */}
        <section className="py-20 bg-surface-container-lowest border-t border-surface-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex items-center justify-between mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Market Intelligence</span>
                <h2 className="font-headline-lg text-3xl font-bold text-on-background mt-1">
                  Latest Research & Insights
                </h2>
              </div>
              <Link href="/blog" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                View All Articles <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {BLOG_POSTS.slice(0, 2).map((post) => (
                <article
                  key={post.slug}
                  className="bg-surface-container-low border border-surface-variant p-8 flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-on-surface-variant">
                      <span className="font-bold text-primary uppercase">{post.category}</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="font-headline-md text-xl font-bold text-on-background hover:text-primary transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-surface-variant flex items-center justify-between text-xs text-on-surface-variant">
                    <span>{post.author.name}</span>
                    <span>{post.publishedAt}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-20 bg-inverse-surface text-inverse-on-surface">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center flex flex-col items-center gap-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white max-w-2xl">
              Ready to Upgrade Your Institutional Asset Portal?
            </h2>
            <p className="text-surface-dim max-w-xl text-base leading-relaxed">
              Apply today for access to our 256-bit encrypted banking infrastructure, real-time ledger reconciliation, and exclusive investment opportunities.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                href="/signup"
                className="px-8 py-3.5 bg-primary text-on-primary font-bold text-sm hover:bg-primary-container transition-colors shadow-md"
              >
                Apply for an Account
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3.5 border border-surface-variant text-white font-bold text-sm hover:bg-surface-container-highest/20 transition-colors"
              >
                Contact Institutional Team
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
