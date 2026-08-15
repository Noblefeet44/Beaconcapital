import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply Securely - Account Registration",
  description:
    "Apply for a new Beacon Capital account. Join institutional asset managers and private capital clients with secure mobile banking.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/signup",
  },
  openGraph: {
    title: "Apply Securely | Beacon Capital Account Registration",
    description:
      "Open your Beacon Capital account today for instant asset reconciliation and secure banking.",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
