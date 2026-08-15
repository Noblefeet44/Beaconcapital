import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In - Secure Account Access",
  description:
    "Log into your secure Beacon Capital account to manage funds, initiate transfers, and reconcile institutional transactions.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Log In | Beacon Capital Secure Portal",
    description:
      "Access your secure Beacon Capital account with 256-bit encryption.",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
