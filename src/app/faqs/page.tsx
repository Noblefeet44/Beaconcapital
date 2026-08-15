"use client";

import React, { useState } from "react";
import PublicHeader from "@/components/public/Header";
import PublicFooter from "@/components/public/Footer";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS_DATA: FAQItem[] = [
  {
    category: "Account & Onboarding",
    question: "Who is eligible to open a Beacon Capital account?",
    answer: "Beacon Capital serves accredited individual investors, family offices, sovereign funds, institutional asset managers, and corporate treasuries seeking private credit placements and digital ledger security.",
  },
  {
    category: "Account & Onboarding",
    question: "What is the account approval process and turnaround time?",
    answer: "Upon submitting an online application via our Apply Now portal, our compliance team performs automated KYC/AML verification. Most institutional applications are reviewed and approved within 1 business day.",
  },
  {
    category: "Security & Ledger Technology",
    question: "How does Beacon Capital ensure the security of client funds?",
    answer: "Beacon Capital employs 256-bit AES-GCM data encryption, hardware-backed multi-factor authentication (MFA), and a zero-trust network perimeter. All customer deposits are held in segregated, audited custodial accounts.",
  },
  {
    category: "Security & Ledger Technology",
    question: "What is digital ledger reconciliation and how does it work?",
    answer: "Our digital ledger technology logs every balance entry, credit movement, and wire transfer onto an append-only cryptographic audit trail. This enables instant position reconciliation without relying on delayed T+2 clearing cycles.",
  },
  {
    category: "Investments & Placements",
    question: "What yield targets does Beacon Capital provide on private credit?",
    answer: "Target yields vary by fund mandate and underlying collateral class, typically ranging from 9.5% to 13.2% net annual return with monthly or quarterly cash payouts.",
  },
  {
    category: "Investments & Placements",
    question: "What are the minimum commitment requirements for investment funds?",
    answer: "Minimum investment commitments range from $100,000 for short-term working capital liquidity pools up to $500,000 for direct commercial real estate mezzanine debt placements.",
  },
  {
    category: "Transfers & Treasury Management",
    question: "How fast are wire transfers processed through the portal?",
    answer: "Internal ledger transfers between Beacon Capital client accounts are settled instantly. External wire distributions are processed via FedNow and automated domestic ACH rails, settling within standard same-day or next-day windows.",
  },
  {
    category: "Transfers & Treasury Management",
    question: "Can corporate treasuries set up multi-user approval controls?",
    answer: "Yes. Beacon Capital supports customizable role-based access control (RBAC), allowing corporate clients to mandate dual-signatory approvals for transactions exceeding specified dollar thresholds.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Account & Onboarding", "Security & Ledger Technology", "Investments & Placements", "Transfers & Treasury Management"];

  const filteredFaqs = selectedCategory === "All"
    ? FAQS_DATA
    : FAQS_DATA.filter((item) => item.category === selectedCategory);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS_DATA.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-background antialiased text-on-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary text-on-primary py-16 lg:py-20">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="max-w-3xl flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">Support & Guidance</span>
              <h1 className="font-display-lg text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Frequently Asked Questions
              </h1>
              <p className="font-body-lg text-lg text-white/90 leading-relaxed">
                Find clear answers about institutional account access, digital ledger reconciliation, private credit yields, and security architecture.
              </p>
            </div>
          </div>
        </section>

        {/* Category Filters & FAQ Accordion */}
        <section className="py-20 bg-surface-container-lowest border-b border-surface-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-12 border-b border-surface-variant pb-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setOpenIndex(null);
                  }}
                  className={`px-4 py-2 text-xs font-bold transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Accordion Items */}
            <div className="flex flex-col gap-4 max-w-4xl">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-surface-variant bg-surface-container-low transition-colors"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full text-left p-6 flex items-center justify-between gap-4 font-bold text-lg text-on-background hover:text-primary transition-colors"
                    >
                      <span>{faq.question}</span>
                      <span className="material-symbols-outlined text-primary text-2xl">
                        {isOpen ? "expand_less" : "expand_more"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 text-sm text-on-surface-variant leading-relaxed border-t border-surface-variant/50 pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
