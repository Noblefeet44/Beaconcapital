import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Console",
  description: "Beacon Capital Internal Email Compose Console",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function EmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
