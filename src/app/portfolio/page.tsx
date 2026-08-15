import React from "react";
import Metadata from "next";
import Link from "next/link";
import PublicHeader from "@/components/public/Header";
import PublicFooter from "@/components/public/Footer";

export const metadata = {
  title: "Portfolio & Track Record | Beacon Capital Projects",
  description:
    "Explore Beacon Capital's portfolio performance, capital deployment projects, and asset class breakdown across commercial debt and infrastructure.",
  alternates: {
    canonical: "https://beaconcapital.site/portfolio",
  },
  openGraph: {
    title: "Portfolio & Track Record | Beacon Capital Capital Deployment",
    description:
      "Explore Beacon Capital's portfolio performance, capital deployment projects, and asset class breakdown across commercial debt and infrastructure.",
    url: "https://beaconcapital.site/portfolio",
  },
};

export default function PortfolioPage() {
  const projects = [
    {
      title: "Midwest Logistics Infrastructure Portfolio",
      category: "Industrial Real Estate Debt",
      capitalDeployed: "$142.5 Million",
      yieldRealized: "11.4% Net IRR",
      status: "Active & Performing",
      location: "Chicago & Indianapolis Metro Corridor",
      summary:
        "First-lien senior mortgage facility financing the acquisition and expansion of a 2.4 million sq. ft. industrial warehouse and cold-storage distribution network.",
      details:
        "Underwritten at a 54% LTV with triple-net (NNN) long-term lease back guarantees from Fortune 500 logistics tenants. Zero covenant defaults reported over 36 consecutive months.",
    },
    {
      title: "Sunbelt Multifamily Recapitalization Facility",
      category: "Commercial Mezzanine Debt",
      capitalDeployed: "$88.0 Million",
      yieldRealized: "12.8% Net IRR",
      status: "Fully Realized / Returned",
      location: "Dallas & Atlanta Metro Hubs",
      summary:
        "Structured debt refinancing for a portfolio of 1,850 Class-A residential units undergoing energy-efficiency modernization and occupancy optimization.",
      details:
        "Provided recapitalization liquidity allowing project sponsor to execute value-add strategy. Full principal plus accrued yield returned 4 months ahead of scheduled maturity.",
    },
    {
      title: "Clean Energy Microgrid & Storage Financing",
      category: "Infrastructure & Energy Credit",
      capitalDeployed: "$65.0 Million",
      yieldRealized: "10.9% Net IRR",
      status: "Active & Performing",
      location: "Texas & California Distribution Grids",
      summary:
        "Asset-backed debt facility collateralized by operational utility-scale battery energy storage systems (BESS) under long-term power purchase agreements (PPAs).",
      details:
        "Structured with direct daily revenue sweeps into Beacon custodial ledger accounts, achieving 100% on-time debt service servicing.",
    },
    {
      title: "Enterprise SaaS Debt Facility",
      category: "Growth Technology Credit",
      capitalDeployed: "$45.0 Million",
      yieldRealized: "13.5% Net IRR",
      status: "Active & Performing",
      location: "San Francisco & New York",
      summary:
        "Non-dilutive senior growth credit extended to a market-leading enterprise cybersecurity software provider with $60M+ Annual Recurring Revenue (ARR).",
      details:
        "Collateralized by software intellectual property rights and contracted annual subscription cash flows, backed by a minimum 2.5x ARR covenant cover.",
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
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">Track Record & Case Studies</span>
              <h1 className="font-display-lg text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Proven Capital Deployment & Portfolio Performance
              </h1>
              <p className="font-body-lg text-lg text-white/90 leading-relaxed">
                Showcasing representative transactions, structured financing facilities, and capital preservation across senior debt and private market sectors.
              </p>
            </div>
          </div>
        </section>

        {/* Portfolio Stats Strip */}
        <section className="py-10 bg-surface-container border-b border-surface-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-primary">$2.4B+</div>
                <div className="text-xs text-on-surface-variant uppercase font-semibold mt-1">Cumulative Capital Funded</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-primary">11.6%</div>
                <div className="text-xs text-on-surface-variant uppercase font-semibold mt-1">Historical Net Weighted IRR</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-primary">0.02%</div>
                <div className="text-xs text-on-surface-variant uppercase font-semibold mt-1">Historical Default Rate</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-primary">100%</div>
                <div className="text-xs text-on-surface-variant uppercase font-semibold mt-1">Real-Time Ledger Audited</div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Showcase */}
        <section className="py-20 bg-surface-container-lowest border-b border-surface-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {projects.map((project, idx) => (
                <div
                  key={idx}
                  className="p-8 bg-surface-container-low border border-surface-variant flex flex-col justify-between gap-6"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-primary uppercase">{project.category}</span>
                      <span className="px-2.5 py-0.5 bg-surface-variant text-on-surface-variant font-semibold">
                        {project.status}
                      </span>
                    </div>
                    <h2 className="font-headline-md text-2xl font-bold text-on-background">
                      {project.title}
                    </h2>
                    <p className="text-xs font-semibold text-on-surface-variant">
                      Location: {project.location}
                    </p>
                    <p className="text-sm text-on-surface leading-relaxed pt-2">
                      {project.summary}
                    </p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {project.details}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-surface-variant grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] text-on-surface-variant uppercase">Capital Deployed</span>
                      <div className="text-lg font-bold text-on-background">{project.capitalDeployed}</div>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant uppercase">Realized Return</span>
                      <div className="text-lg font-bold text-primary">{project.yieldRealized}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
