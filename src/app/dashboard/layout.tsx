import type { Metadata } from "next";
import IdleLogoutProvider from "@/components/dashboard/IdleLogoutProvider";

export const metadata: Metadata = {
  title: "User Dashboard",
  description: "Beacon Capital Private Account Dashboard",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <IdleLogoutProvider>{children}</IdleLogoutProvider>;
}

