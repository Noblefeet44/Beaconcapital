"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Opportunities", href: "/investment-opportunities" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Blog", href: "/blog" },
    { name: "FAQs", href: "/faqs" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md border-b border-surface-variant transition-all">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:bg-primary-container transition-colors">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: "24px" }}
            >
              account_balance
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md font-extrabold text-on-background tracking-tight">
              BEACON CAPITAL
            </span>
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest -mt-1">
              Institutional Asset Management
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-body-md text-sm font-semibold transition-colors py-1 border-b-2 ${
                isActive(link.href)
                  ? "text-primary border-primary"
                  : "text-on-surface-variant hover:text-primary border-transparent"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Auth Action CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/login"
            className="font-label-sm text-sm px-4 py-2 text-primary border border-primary hover:bg-primary/5 transition-colors font-bold"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="font-label-sm text-sm px-5 py-2 bg-primary text-on-primary hover:bg-primary-container transition-colors font-bold shadow-sm"
          >
            Apply Now
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-on-background hover:bg-surface-container transition-colors"
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-container-lowest border-b border-surface-variant px-margin-mobile py-md flex flex-col gap-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-body-md text-base py-2 px-3 transition-colors ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-on-surface hover:bg-surface-container"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2 pt-3 border-t border-surface-variant">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center font-label-sm py-2.5 text-primary border border-primary font-bold"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center font-label-sm py-2.5 bg-primary text-on-primary font-bold shadow-sm"
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
