import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Stratum Live",
  description: "Your workspaces and prompts",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col bg-background">
      {children}
    </div>
  );
}