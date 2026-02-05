// app/layout.tsx (or app/(dashboard)/layout.tsx)
import { prefetch, HydrateClient } from "@/lib/convex/rsc";
import { crpc } from "@/lib/convex/rsc";
import { redirect } from "next/navigation";
import { caller } from "@/lib/convex/rsc";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuth = await caller.isAuth();

  // 2. Validate and Redirect if necessary
  if (!isAuth) {
    redirect("/auth");
  }

  // Prefetch session user data for client hydration
  await prefetch(crpc.user.getSessionUser.queryOptions());
  // 3. Render children with hydration boundary
  return <HydrateClient>{children}</HydrateClient>;
}
