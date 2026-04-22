import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace - Stratum Live",
};

export default async function WorkspaceLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}>) {
  const authed = await isAuthenticated();
  
  if (!authed) {
    redirect("/auth");
  }

  return <>{children}</>;
}