import type { Doc, Id } from "../functions/_generated/dataModel";
import { createAuth } from "../functions/auth";

export type SessionUser = Omit<Doc<"user">, "_creationTime" | "_id"> & {
  id: Id<"user">;
  isAdmin: boolean;
  session: Doc<"session">;
  impersonatedBy?: string;
  plan?: "premium" | "team";
};
export type Auth = Awaited<ReturnType<typeof createAuth>>;
