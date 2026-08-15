import React from "react";
import Metadata from "next";
import Link from "next/link";
import PublicHeader from "@/components/public/Header";
import PublicFooter from "@/components/public/Footer";

export const metadata = {
  title: "About Us | Beacon Capital Institutional Asset Management",
  description:
    "Learn about Beacon Capital's mission, executive experience, regulatory standards, and 256-bit encrypted ledger reconciliation technology.",
  alternates: {
    canonical: "https://beaconcapital.site/about",
  },
  openGraph: {
    title: "About Us | Beacon Capital",
    description:
      "Learn about Beacon Capital's mission, executive experience, regulatory standards, and encrypted ledger technology.",
    url: "https://beaconcapital.site/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background antialiased text-on-background">
      <PublicHeader />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="bg-primary text-on-primary py-16 lg:py-20 relative">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="max-w-3xl flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">Company Overview</span>
              <h1 className="font-display-lg text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Institutional Integrity, Modern Ledger Security
              </h1>
              <p className="font-body-lg text-lg text-white/90 leading-relaxed">
                Beacon Capital was founded to bridge the gap between traditional private credit syndication and real-time digital asset reconciliation.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Core Values */}
        <section className="py-20 bg-surface-container-lowest border-b border-surface-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-6">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Our Mission</span>
                <h2 className="font-headline-lg text-3xl font-bold text-on-background">
                  Redefining Capital Efficiency & Collateral Assurance
                </h2>
                <p className="text-base text-on-surface-variant leading-relaxed">
                  Beacon Capital provides tier-one institutional investors, sovereign funds, and accredited clients with frictionless capital deployment. By leveraging immutable audit rails and multi-layer ledger settlement, we eliminate the operational latency inherent in conventional banking portals.
                </p>
                <p className="text-base text-on-surface-variant leading-relaxed">
                  Our investment mandate prioritizes senior secured credit, high-yield structured debt, and mission-critical real estate financing, maintaining conservative loan-to-value ratios across all economic cycles.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-surface-container-low border border-surface-variant flex flex-col gap-2">
                  <span className="material-symbols-outlined text-primary text-3xl">verified</span>
                  <h3 className="font-bold text-lg text-on-background">Fiduciary Duty</h3>
                  <p className="text-xs text-on-surface-variant">Uncompromising commitment to capital preservation and regulatory compliance.</p>
                </div>
                <div className="p-6 bg-surface-container-low border border-surface-variant flex flex-col gap-2">
                  <span className="material-symbols-outlined text-primary text-3xl">shield_lock</span>
                  <h3 className="font-bold text-lg text-on-background">Zero-Trust Security</h3>
                  <p className="text-xs text-on-surface-variant">Hardware-backed cryptographic controls and continuous vulnerability assessments.</p>
                </div>
                <div className="p-6 bg-surface-container-low border border-surface-variant flex flex-col gap-2">
                  <span className="material-symbols-outlined text-primary text-3xl">sync_alt</span>
                  <h3 className="font-bold text-lg text-on-background">Real-Time Auditing</h3>
                  <p className="text-xs text-on-surface-variant">Instantaneous ledger verification ensuring absolute transparency across balance entries.</p>
                </div>
                <div className="p-6 bg-surface-container-low border border-surface-variant flex flex-col gap-2">
                  <span className="material-symbols-outlined text-primary text-3xl">public</span>
                  <h3 className="font-bold text-lg text-on-background">Global Liquidity</h3>
                  <p className="text-xs text-on-surface-variant">Seamless cross-border transaction capabilities with integrated currency controls.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Executive Principles */}
        <section className="py-20 bg-background">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Governance Standards</span>
              <h2 className="font-headline-lg text-3xl font-bold text-on-background mt-1">
                Built on Rigorous Institutional Protocols
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-surface-container-lowest border border-surface-variant flex flex-col gap-4">
                <span className="text-4xl font-extrabold text-primary">01</span>
                <h3 className="font-bold text-xl text-on-background">Institutional Due Diligence</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Every borrower and assets collateralized on our portal undergoes multi-stage underwriting, background audits, and independent appraisal.
                </p>
              </div>

              <div className="p-8 bg-surface-container-lowest border border-surface-variant flex flex-col gap-4">
                <span className="text-4xl font-extrabold text-primary">02</span>
                <h3 className="font-bold text-xl text-on-background">Encrypted Data Isolation</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  User accounts and ledger balances are isolated using cryptographic key segmentation to guarantee strict confidentiality.
                </p>
              </div>

              <div className="p-8 bg-surface-container-lowest border border-surface-variant flex flex-col gap-4">
                <span className="text-4xl font-extrabold text-primary">03</span>
                <h3 className="font-bold text-xl text-on-background">Continuous Risk Monitoring</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Automated risk engines evaluate portfolio covenants continuously, generating early warnings if collateral parameters shift.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-on-primary">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center flex flex-col items-center gap-6">
            <h2 className="text-3xl font-extrabold text-white">Partner with Beacon Capital</h2>
            <p className="text-white/90 max-w-xl text-base">
              Discover how our institutional capital management solutions can enhance your treasury and asset returns.
            </p>
            <div className="flex gap-4">
              <Link
                href="/services"
                className="px-8 py-3 bg-white text-primary font-bold text-sm hover:bg-surface-container-low transition-colors"
              >
                Our Services
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 border border-white text-white font-bold text-sm hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
