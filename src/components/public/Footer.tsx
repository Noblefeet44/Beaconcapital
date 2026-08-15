import React from "react";
import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface pt-16 pb-12 border-t border-surface-variant">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-surface-container-highest/20">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary flex items-center justify-center text-on-primary">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1", fontSize: "22px" }}
                >
                  account_balance
                </span>
              </div>
              <span className="font-headline-md text-xl font-bold tracking-tight text-white">
                BEACON CAPITAL
              </span>
            </div>
            <p className="text-sm text-surface-dim max-w-sm leading-relaxed">
              Beacon Capital provides premier secure banking, institutional asset allocation, and multi-layer ledger reconciliation for high-net-worth clients and corporate treasuries.
            </p>
            <div className="flex items-center gap-2 text-xs text-surface-variant mt-2">
              <span className="material-symbols-outlined text-primary text-base">verified_user</span>
              <span>256-Bit SSL Encrypted & SOC 2 Type II Certified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-label-sm text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-surface-dim">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">Services</Link>
              </li>
              <li>
                <Link href="/investment-opportunities" className="hover:text-white transition-colors">Investment Opportunities</Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-white transition-colors">Portfolio & Track Record</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-3">
            <h4 className="font-label-sm text-xs font-bold uppercase tracking-wider text-white">
              Resources & Insights
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-surface-dim">
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">Articles & Insights</Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-white transition-colors">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="hover:text-white transition-colors">XML Sitemap</Link>
              </li>
            </ul>
          </div>

          {/* Client Portal */}
          <div className="flex flex-col gap-3">
            <h4 className="font-label-sm text-xs font-bold uppercase tracking-wider text-white">
              Account Access
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-surface-dim">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">Client Portal Log In</Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors">Apply for Account</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">System Admin Access</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Legal Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-surface-dim">
          <p>© {new Date().getFullYear()} Beacon Capital Inc. All rights reserved. Registered Institutional Asset Portal.</p>
          <div className="flex items-center gap-6">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Regulatory Disclosures</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
