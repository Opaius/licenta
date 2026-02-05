"use client";
import { useCRPC } from "@/lib/convex/crpc";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const crpc = useCRPC();

  const { data: user } = useQuery(crpc.user.getSessionUser.queryOptions());
  console.log(user);
  return <h1>Welcome to the Dashboard : {user?.name}</h1>;
}
