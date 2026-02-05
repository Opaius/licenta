import { CRPCError, initCRPC } from "better-convex/server";
import {
  query,
  mutation,
  internalQuery,
  internalMutation,
  action,
  internalAction,
} from "../functions/_generated/server";
import type {
  ActionCtx,
  MutationCtx,
  QueryCtx,
} from "../functions/_generated/server";
import type { DataModel, Id } from "../functions/_generated/dataModel";
import { getCtxWithTable } from "./ents";
import { getHeaders, getSession } from "better-convex/auth";
import { getAuth } from "../functions/auth";
import z from "zod/v4";
import { Session, User } from "better-auth";
import { Zid } from "convex-helpers/server/zod4";

export type GenericCtx = QueryCtx | MutationCtx | ActionCtx;

const c = initCRPC
  .dataModel<DataModel>()
  .context({
    query: (ctx) => getCtxWithTable(ctx),
    mutation: (ctx) => getCtxWithTable(ctx),
  })
  .create({
    query,
    internalQuery,
    mutation,
    internalMutation,
    action,
    internalAction,
  });

export const publicQuery = c.query;
export const publicMutation = c.mutation;
const devMiddleware = c.middleware<{ dev?: boolean }>(({ meta, next, ctx }) => {
  if (
    (meta as { dev?: boolean }).dev &&
    process.env.DEPLOY_ENV === "production"
  ) {
    throw new CRPCError({
      code: "FORBIDDEN",
      message: "This function is only available in development",
    });
  }
  return next({ ctx });
});
type OptionalAuthContext = {
  user: {
    id: Id<"user">;
    _id: Id<"user">;
    _creationTime: number;
    banExpires?: number | undefined;
    banReason?: string | undefined;
    banned?: boolean | undefined;
    image?: string | undefined;
    role?: string | undefined;
    createdAt: number;
    updatedAt: number;
    email: string;
    emailVerified: boolean;
    name: string;
  } | null;
};
export const optionalAuthQuery = c.query
  .meta({ auth: "optional" })
  .use(devMiddleware)
  .use<OptionalAuthContext>(async ({ ctx, next }) => {
    const session = await getSession(ctx);
    if (!session) {
      return next({ ctx: { ...ctx, user: null, userId: null } });
    }
    const user = await ctx.table("user").getX(session.userId);
    return next({
      ctx: {
        user: { id: user._id, ...user.doc() },
      },
    });
  });
