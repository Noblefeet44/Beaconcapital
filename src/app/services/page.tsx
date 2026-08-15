import React from "react";
import Metadata from "next";
import Link from "next/link";
import PublicHeader from "@/components/public/Header";
import PublicFooter from "@/components/public/Footer";

export const metadata = {
  title: "Services | Wealth Management & Institutional Asset Solutions",
  description:
    "Explore Beacon Capital's financial services: Wealth Allocation, Private Equity Debt, Digital Ledger Reconciliation, and Corporate Treasury Banking.",
  alternates: {
    canonical: "https://beaconcapital.site/services",
  },
  openGraph: {
    title: "Services | Beacon Capital Financial Solutions",
    description:
      "Explore Beacon Capital's financial services: Wealth Allocation, Private Equity Debt, Digital Ledger Reconciliation, and Corporate Treasury Banking.",
    url: "https://beaconcapital.site/services",
  },
};

export default function ServicesPage() {
  const servicesList = [
    {
      icon: "account_balance_wallet",
      title: "Wealth & Private Asset Allocation",
      description:
        "Customized asset management portfolios structured for family offices, sovereign funds, and accredited investors seeking long-term capital preservation with target yields.",
      details: [
        "Tailored risk-return profiling and capital deployment schedules",
        "Direct access to co-investment opportunities in tier-one assets",
        "Automated yield sweeps and tax-optimized distributions",
      ],
    },
    {
      icon: "receipt_long",
      title: "Digital Ledger Reconciliation",
      description:
        "Real-time, immutable audit trails for fund transactions, multi-layer internal transfers, and corporate ledger verification.",
      details: [
        "256-bit cryptographic verification for every transaction entry",
        "Instant settlement confirmation eliminating T+2 clearing friction",
        "Exportable compliance records compatible with institutional ERP systems",
      ],
    },
    {
      icon: "trending_up",
      title: "Private Credit & Senior Debt Financing",
      description:
        "Direct lending solutions providing senior secured loans to middle-market commercial enterprises and real estate developments.",
      details: [
        "Conservative loan-to-value (LTV) limits under 65%",
        "Floating-rate coupon structures offering inflation resilience",
        "First-lien covenant enforcement and continuous collateral auditing",
      ],
    },
    {
      icon: "payments",
      title: "Corporate Treasury & Cash Management",
      description:
        "Programmatic liquidity management enabling corporate treasurers to automate wire payouts, sweep excess cash, and monitor capital velocity.",
      details: [
        "Automated overnight liquidity sweeps to high-yielding money market accounts",
        "Multi-user permission workflows with dual-signatory approval controls",
        "Real-time balance notifications and intraday wire settlement",
      ],
    },
    {
      icon: "domain",
      title: "Institutional Real Estate Debt",
      description:
        "Structured senior debt and mezzanine financing for mission-critical industrial logistics, multifamily, and medical commercial real estate.",
      details: [
        "Rigorous geographic due diligence in high-growth metro markets",
        "Direct title deed collateralization and escrow supervision",
        "Flexible repayment terms paired with cash flow covenant checks",
      ],
    },
    {
      icon: "shield",
      title: "Escrow & Custodial Solutions",
      description:
        "Secure third-party escrow services ensuring seamless execution of mergers, acquisitions, and cross-border commercial transactions.",
      details: [
        "Independent milestone verification before capital release",
        "Multi-currency account holding with instant conversion routing",
        "Fully segregated client asset accounts adhering to strict custodial guidelines",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background antialiased text-on-background">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="bg-primary text-on-primary py-16 lg:py-20">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="max-w-3xl flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">Capabilities & Solutions</span>
              <h1 className="font-display-lg text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Comprehensive Institutional Financial Services
              </h1>
              <p className="font-body-lg text-lg text-white/90 leading-relaxed">
                Designed to deliver absolute clarity, high capital velocity, and robust risk management for corporate treasuries and institutional asset managers.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 bg-surface-container-lowest border-b border-surface-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {servicesList.map((service, index) => (
                <div
                  key={index}
                  className="p-8 bg-surface-container-low border border-surface-variant flex flex-col gap-5 hover:border-primary/40 transition-all"
                >
                  <div className="w-14 h-14 bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">{service.icon}</span>
                  </div>
                  <h2 className="font-headline-md text-2xl font-bold text-on-background">
                    {service.title}
                  </h2>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="flex flex-col gap-2 pt-2 border-t border-surface-variant text-xs text-on-surface">
                    {service.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-background">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center flex flex-col items-center gap-6">
            <h2 className="text-3xl font-extrabold text-on-background">Need a Customized Financial Solution?</h2>
            <p className="text-on-surface-variant max-w-xl text-sm leading-relaxed">
              Our institutional advisory team works closely with family offices and fund managers to structure custom credit and custodial agreements.
            </p>
            <Link
              href="/contact"
              className="px-8 py-3.5 bg-primary text-on-primary font-bold text-sm hover:bg-primary-container transition-colors shadow-sm"
            >
              Consult with Our Advisory Team
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
