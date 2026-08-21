"use client";

import React, { useState } from "react";
import PublicHeader from "@/components/public/Header";
import PublicFooter from "@/components/public/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setStatusMsg({
        type: "success",
        text: data.message || "Thank you. Your inquiry has been submitted successfully.",
      });

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        organization: "",
        message: "",
      });
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err.message || "An error occurred while submitting your message.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background antialiased text-on-background">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary text-on-primary py-16 lg:py-20">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="max-w-3xl flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">Connect With Us</span>
              <h1 className="font-display-lg text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Contact Institutional Advisory
              </h1>
              <p className="font-body-lg text-lg text-white/90 leading-relaxed">
                Reach out to our global team for partnership inquiries, capital placements, or platform support.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content: Info & Form */}
        <section className="py-20 bg-surface-container-lowest border-b border-surface-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="flex flex-col gap-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Global Offices</span>
                  <h2 className="font-headline-lg text-3xl font-bold text-on-background mt-1">
                    Direct Financial Support
                  </h2>
                  <p className="text-sm text-on-surface-variant leading-relaxed mt-2">
                    Our advisors are available to assist with onboarding, private placement memorandums, and custom treasury integrations.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-4 p-6 bg-surface-container-low border border-surface-variant">
                    <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined">location_on</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-on-background">Headquarters</h3>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Beacon Capital Plaza, 100 Financial District, New York, NY 10005
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-surface-container-low border border-surface-variant">
                    <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-on-background">Email Support</h3>
                      <p className="text-xs text-on-surface-variant mt-1">
                        General Support: <a href="mailto:support@beaconcapital.site" className="text-primary font-semibold hover:underline">support@beaconcapital.site</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-surface-container-low border border-surface-variant">
                    <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined">phone</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-on-background">Phone Support</h3>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Direct Line: <a href="tel:+15123752360" className="text-primary font-semibold hover:underline">+1 (512) 375-2360</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-surface-container-low border border-surface-variant">
                    <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-on-background">Service Hours</h3>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Monday – Friday: 08:00 – 18:00 EST | 24/7 Security Escalation
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form Card */}
              <div className="p-8 md:p-10 bg-surface-container-low border border-surface-variant">
                <h2 className="font-headline-lg text-2xl font-bold text-on-background mb-2">
                  Send an Inquiry
                </h2>
                <p className="text-xs text-on-surface-variant mb-6">
                  Fill out the form below. An institutional advisor will respond within 24 business hours.
                </p>

                {statusMsg && (
                  <div
                    className={`p-4 mb-6 text-sm flex items-center gap-2 border ${
                      statusMsg.type === "success"
                        ? "bg-green-50 border-green-300 text-green-800"
                        : "bg-error-container border-error text-error"
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      {statusMsg.type === "success" ? "check_circle" : "error"}
                    </span>
                    <span>{statusMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-background" htmlFor="fullName">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="bg-surface-container-lowest border border-surface-variant p-3 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-on-background" htmlFor="email">
                        Work Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="name@firm.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-surface-container-lowest border border-surface-variant p-3 text-sm outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-on-background" htmlFor="phone">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-surface-container-lowest border border-surface-variant p-3 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-background" htmlFor="organization">
                      Organization / Firm Name
                    </label>
                    <input
                      id="organization"
                      type="text"
                      placeholder="e.g. Sovereign Wealth Corp"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="bg-surface-container-lowest border border-surface-variant p-3 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-background" htmlFor="message">
                      Inquiry Details *
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      placeholder="Specify your investment parameters or questions..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-surface-container-lowest border border-surface-variant p-3 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 py-3.5 bg-primary text-on-primary font-bold text-sm hover:bg-primary-container transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {loading ? "Transmitting Inquiry..." : "Submit Inquiry"}
                    <span className="material-symbols-outlined text-base">send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
