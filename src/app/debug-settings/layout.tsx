import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - Stratum Live",
};

export default async function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authed = await isAuthenticated();
  
  if (!authed) {
    redirect("/auth");
  }

  return <>{children}</>;
}