import React from "react";
import Metadata from "next";
import Link from "next/link";
import PublicHeader from "@/components/public/Header";
import PublicFooter from "@/components/public/Footer";

export const metadata = {
  title: "Investment Opportunities | Beacon Capital Private Funds",
  description:
    "Review institutional investment opportunities: Private Credit Fund II, Commercial Real Estate Debt, and Infrastructure Secured Yield placements.",
  alternates: {
    canonical: "https://beaconcapital.site/investment-opportunities",
  },
  openGraph: {
    title: "Investment Opportunities | Beacon Capital Placement Portal",
    description:
      "Review institutional investment opportunities: Private Credit Fund II, Commercial Real Estate Debt, and Infrastructure Secured Yield placements.",
    url: "https://beaconcapital.site/investment-opportunities",
  },
};

export default function InvestmentOpportunitiesPage() {
  const opportunities = [
    {
      title: "Beacon Private Credit & Infrastructure Yield Fund II",
      targetYield: "11.8% Net Annual",
      distribution: "Monthly Cash Payout",
      assetClass: "Senior Secured Commercial Debt",
      minimumInvestment: "$250,000",
      term: "36 Months",
      status: "Actively Subscribing",
      description:
        "Senior-secured floating rate direct lending collateralized by mission-critical logistics hubs, renewable energy infrastructure, and enterprise debt.",
      highlights: [
        "First-lien mortgage and asset pledge protection",
        "Weighted average Loan-to-Value (LTV) of 58.4%",
        "Audited monthly ledger distributions with direct bank sweep",
      ],
    },
    {
      title: "Tier-1 Metro Commercial Real Estate Mezzanine Debt",
      targetYield: "13.2% Net Annual",
      distribution: "Quarterly Cash Payout",
      assetClass: "Subordinated CRE Debt & Equity Kicker",
      minimumInvestment: "$500,000",
      term: "24 Months",
      status: "Limited Allocation",
      description:
        "High-yield debt capital facilitating recapitalization of class-A multifamily and medical office complexes in high-growth North American metropolitan markets.",
      highlights: [
        "Strong debt service coverage ratio (DSCR > 1.65x)",
        "Personal completion and carry guarantees from sponsor",
        "Equity upside participation upon asset disposition",
      ],
    },
    {
      title: "Short-Term Working Capital & Trade Finance Liquidity Pool",
      targetYield: "9.5% Net Annual",
      distribution: "Daily Compounded / Monthly Liquidity",
      assetClass: "Trade Receivables & Invoice Factoring",
      minimumInvestment: "$100,000",
      term: "Open-Ended (30-Day Notice)",
      status: "Actively Subscribing",
      description:
        "Short-duration liquidity pool providing working capital financing to blue-chip corporate accounts with insured trade credit guarantees.",
      highlights: [
        "Full trade credit insurance coverage underwritten by tier-1 carriers",
        "Flexible 30-day redemption window for enhanced corporate liquidity",
        "Real-time balance tracking via the Beacon client dashboard",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background antialiased text-on-background">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary text-on-primary py-16 lg:py-20">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="max-w-3xl flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">Capital Placements</span>
              <h1 className="font-display-lg text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Institutional Private Market Placements
              </h1>
              <p className="font-body-lg text-lg text-white/90 leading-relaxed">
                Direct access to high-yield private credit, structured commercial debt, and asset-backed liquidity funds with real-time auditability.
              </p>
            </div>
          </div>
        </section>

        {/* Opportunities List */}
        <section className="py-20 bg-surface-container-lowest border-b border-surface-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-col gap-12">
              {opportunities.map((opp, index) => (
                <div
                  key={index}
                  className="p-8 md:p-10 bg-surface-container-low border border-surface-variant flex flex-col lg:flex-row justify-between gap-8"
                >
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-primary text-on-primary text-xs font-bold uppercase">
                        {opp.status}
                      </span>
                      <span className="text-xs font-semibold text-on-surface-variant">
                        Asset Class: {opp.assetClass}
                      </span>
                    </div>
                    <h2 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-background">
                      {opp.title}
                    </h2>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {opp.description}
                    </p>

                    <div className="pt-4 border-t border-surface-variant flex flex-col gap-2">
                      <span className="text-xs font-bold text-on-background uppercase">Key Placement Highlights:</span>
                      <ul className="flex flex-col gap-1 text-xs text-on-surface">
                        {opp.highlights.map((h, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Financial Terms Column */}
                  <div className="lg:w-80 p-6 bg-surface-container-lowest border border-surface-variant flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-3">
                      <div className="border-b border-surface-variant pb-2">
                        <span className="text-xs text-on-surface-variant uppercase">Targeted Net Yield</span>
                        <div className="text-2xl font-extrabold text-primary">{opp.targetYield}</div>
                      </div>
                      <div className="border-b border-surface-variant pb-2">
                        <span className="text-xs text-on-surface-variant uppercase">Distribution Frequency</span>
                        <div className="text-sm font-bold text-on-background">{opp.distribution}</div>
                      </div>
                      <div className="border-b border-surface-variant pb-2">
                        <span className="text-xs text-on-surface-variant uppercase">Minimum Commitment</span>
                        <div className="text-sm font-bold text-on-background">{opp.minimumInvestment}</div>
                      </div>
                      <div>
                        <span className="text-xs text-on-surface-variant uppercase">Investment Term</span>
                        <div className="text-sm font-bold text-on-background">{opp.term}</div>
                      </div>
                    </div>

                    <Link
                      href="/signup"
                      className="w-full text-center py-3 bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-colors shadow-sm"
                    >
                      Request Fund Offering Memorandum
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Investor Disclaimer Box */}
            <div className="mt-14 p-6 bg-surface-container border border-surface-variant text-xs text-on-surface-variant leading-relaxed">
              <span className="font-bold text-on-background uppercase block mb-1">Regulatory & Risk Notice:</span>
              Private market investments involve risk including potential loss of principal. Target yields are based on internal underwriting estimates and are not guaranteed. Placements are restricted to verified accredited investors and institutional clients pursuant to applicable regulatory exemptions.
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
