import { ConvexProvider } from "@/lib/convex/convex-provider";
import { caller } from "@/lib/convex/rsc";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await caller.getToken();

  return <ConvexProvider token={token}>{children}</ConvexProvider>;
}
