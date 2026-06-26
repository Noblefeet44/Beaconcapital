"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ComprehensiveSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    dob: "",
    idType: "",
    idNumber: "",
    issuance: "",
    expiry: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col antialiased">
      {/* Top Banner */}
      <header className="bg-primary w-full h-40 flex flex-col items-center justify-center relative shadow-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-50"></div>
        <div className="flex items-center gap-3 relative z-10">
          <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "36px" }}>
            account_balance
          </span>
          <h1 className="font-headline-md text-headline-md font-bold text-on-primary tracking-tight">BEACON CAPITAL</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-margin-mobile md:px-margin-desktop py-lg flex flex-col -mt-10 relative z-20 max-w-[600px] w-full mx-auto gap-md">
        {/* Application Card */}
        <div className="bg-surface-container-lowest border border-surface-variant p-md shadow-[0px_4px_8px_rgba(0,0,0,0.04)] w-full">
          <div className="border-b border-surface-variant pb-sm mb-lg">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">Account Application</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Open a Premium Secure Ledger Vault</p>
          </div>

          {error && (
            <div className="bg-error-container border border-error text-error text-sm p-sm mb-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-error" style={{ fontSize: "20px" }}>
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="flex flex-col gap-md">
            {/* Section: Personal Details */}
            <div className="space-y-sm">
              <h3 className="font-label-sm text-label-sm text-primary uppercase tracking-wider border-b border-surface-variant pb-xs">
                1. Personal Details
              </h3>
              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface" htmlFor="firstName">First Name</label>
                  <input
                    className="w-full px-sm py-sm border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-none focus:border-primary focus:outline-none transition-colors"
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface" htmlFor="lastName">Last Name</label>
                  <input
                    className="w-full px-sm py-sm border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-none focus:border-primary focus:outline-none transition-colors"
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="username">Email Address (User ID)</label>
                <input
                  className="w-full px-sm py-sm border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-none focus:border-primary focus:outline-none transition-colors"
                  id="username"
                  name="username"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface" htmlFor="phone">Phone Number</label>
                  <input
                    className="w-full px-sm py-sm border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-none focus:border-primary focus:outline-none transition-colors"
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface" htmlFor="dob">Date of Birth</label>
                  <input
                    className="w-full px-sm py-sm border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-none focus:border-primary focus:outline-none transition-colors"
                    id="dob"
                    name="dob"
                    type="date"
                    required
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Section: Credentials */}
            <div className="space-y-sm">
              <h3 className="font-label-sm text-label-sm text-primary uppercase tracking-wider border-b border-surface-variant pb-xs">
                2. Security Credentials
              </h3>
              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface" htmlFor="password">Password</label>
                  <input
                    className="w-full px-sm py-sm border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-none focus:border-primary focus:outline-none transition-colors"
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface" htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    className="w-full px-sm py-sm border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-none focus:border-primary focus:outline-none transition-colors"
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Section: ID Verification */}
            <div className="space-y-sm">
              <h3 className="font-label-sm text-label-sm text-primary uppercase tracking-wider border-b border-surface-variant pb-xs">
                3. Identity Verification
              </h3>
              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface" htmlFor="idType">ID Type</label>
                  <select
                    className="w-full px-sm py-sm border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-none focus:border-primary focus:outline-none transition-colors"
                    id="idType"
                    name="idType"
                    required
                    value={formData.idType}
                    onChange={handleChange}
                  >
                    <option value="">Select ID Type</option>
                    <option value="dl">Driver's License</option>
                    <option value="state_id">State ID</option>
                    <option value="passport">Passport</option>
                  </select>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface" htmlFor="idNumber">ID Number</label>
                  <input
                    className="w-full px-sm py-sm border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-none focus:border-primary focus:outline-none transition-colors"
                    id="idNumber"
                    name="idNumber"
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface" htmlFor="issuance">State/Country of Issuance</label>
                  <input
                    className="w-full px-sm py-sm border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-none focus:border-primary focus:outline-none transition-colors"
                    id="issuance"
                    name="issuance"
                    type="text"
                    required
                    value={formData.issuance}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface" htmlFor="expiry">Expiration Date</label>
                  <input
                    className="w-full px-sm py-sm border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-none focus:border-primary focus:outline-none transition-colors"
                    id="expiry"
                    name="expiry"
                    type="date"
                    required
                    value={formData.expiry}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Primary Action */}
            <button
              className="w-full bg-primary text-on-primary font-label-sm text-label-sm py-sm mt-sm hover:bg-primary-container transition-colors duration-200 shadow-sm flex items-center justify-center gap-xs disabled:bg-primary/50"
              type="submit"
              disabled={loading}
            >
              {loading ? "Submitting application..." : "Sign Up Securely"}
            </button>
          </form>
        </div>

        {/* Secondary Links */}
        <div className="w-full text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline decoration-2">
              Log In
            </Link>
          </p>
        </div>

        {/* Trust Signals */}
        <div className="w-full mt-lg pt-lg border-t border-surface-variant flex flex-col items-center justify-center text-tertiary gap-xs">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            enhanced_encryption
          </span>
          <p className="font-label-sm text-label-sm uppercase tracking-wider">256-bit Encrypted Connection</p>
          <p className="font-body-md text-body-md text-xs mt-xs text-center max-w-[320px]">
            Your institutional data is protected by industry-leading security protocols.
          </p>
        </div>
      </main>
    </div>
  );
}
