"use client";

// Import the generated bones registry (created by `npx boneyard-js build`)
import "../bones/registry";

export default function BoneyardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
