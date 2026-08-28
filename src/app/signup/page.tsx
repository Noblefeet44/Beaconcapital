"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PublicHeader from "@/components/public/Header";
import PublicFooter from "@/components/public/Footer";

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

      router.push("/pending");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col antialiased">
      <PublicHeader />

      {/* Main Content Area */}
      <main className="flex-1 py-16 px-margin-mobile md:px-margin-desktop max-w-[640px] w-full mx-auto flex flex-col gap-6">
        {/* Application Card */}
        <div className="bg-surface-container-lowest border border-surface-variant p-8 md:p-10 shadow-sm w-full">
          <div className="border-b border-surface-variant pb-4 mb-6">
            <h1 className="font-headline-lg text-2xl font-bold text-on-background">Account Application</h1>
            <p className="font-body-md text-xs text-on-surface-variant mt-1">Open a Premium Secure Institutional Account</p>
          </div>

          {error && (
            <div className="bg-error-container border border-error text-error text-xs p-3 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-base">
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="flex flex-col gap-6">
            {/* Section: Personal Details */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-surface-variant pb-1">
                1. Personal & Contact Details
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface" htmlFor="firstName">First Name</label>
                  <input
                    className="w-full px-3 py-2 border border-surface-variant bg-surface-container-lowest text-on-surface text-sm focus:border-primary outline-none"
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface" htmlFor="lastName">Last Name</label>
                  <input
                    className="w-full px-3 py-2 border border-surface-variant bg-surface-container-lowest text-on-surface text-sm focus:border-primary outline-none"
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface" htmlFor="username">Email Address (User ID)</label>
                <input
                  className="w-full px-3 py-2 border border-surface-variant bg-surface-container-lowest text-on-surface text-sm focus:border-primary outline-none"
                  id="username"
                  name="username"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface" htmlFor="phone">Phone Number</label>
                  <input
                    className="w-full px-3 py-2 border border-surface-variant bg-surface-container-lowest text-on-surface text-sm focus:border-primary outline-none"
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface" htmlFor="dob">Date of Birth</label>
                  <input
                    className="w-full px-3 py-2 border border-surface-variant bg-surface-container-lowest text-on-surface text-sm focus:border-primary outline-none"
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
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-surface-variant pb-1">
                2. Security Credentials
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface" htmlFor="password">Password</label>
                  <input
                    className="w-full px-3 py-2 border border-surface-variant bg-surface-container-lowest text-on-surface text-sm focus:border-primary outline-none"
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface" htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    className="w-full px-3 py-2 border border-surface-variant bg-surface-container-lowest text-on-surface text-sm focus:border-primary outline-none"
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
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-surface-variant pb-1">
                3. Identity Verification
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface" htmlFor="idType">ID Type</label>
                  <select
                    className="w-full px-3 py-2 border border-surface-variant bg-surface-container-lowest text-on-surface text-sm focus:border-primary outline-none"
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
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface" htmlFor="idNumber">ID Number</label>
                  <input
                    className="w-full px-3 py-2 border border-surface-variant bg-surface-container-lowest text-on-surface text-sm focus:border-primary outline-none"
                    id="idNumber"
                    name="idNumber"
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface" htmlFor="issuance">Issuing Jurisdiction</label>
                  <input
                    className="w-full px-3 py-2 border border-surface-variant bg-surface-container-lowest text-on-surface text-sm focus:border-primary outline-none"
                    id="issuance"
                    name="issuance"
                    type="text"
                    required
                    value={formData.issuance}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface" htmlFor="expiry">Expiration Date</label>
                  <input
                    className="w-full px-3 py-2 border border-surface-variant bg-surface-container-lowest text-on-surface text-sm focus:border-primary outline-none"
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
              className="w-full bg-primary text-on-primary font-bold text-sm py-3 mt-2 hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? "Submitting Application..." : "Submit Application Securely"}
            </button>
          </form>
        </div>

        {/* Secondary Links */}
        <div className="w-full text-center">
          <p className="text-xs text-on-surface-variant">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>

        {/* Security Badge */}
        <div className="flex flex-col items-center justify-center text-xs text-on-surface-variant gap-1 mt-2">
          <span className="material-symbols-outlined text-primary">
            enhanced_encryption
          </span>
          <p className="font-bold">256-bit SSL Encrypted Connection</p>
          <p className="text-center text-[11px]">
            Your institutional data is protected by industry-leading security protocols.
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
