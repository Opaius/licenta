import { z } from "zod/v4";
import { zid } from "convex-helpers/server/zod4";
import { optionalAuthQuery } from "../lib/crpc";

/** Check if user is authenticated */
export const isAuth = optionalAuthQuery
  .output(z.boolean())
  .query(async ({ ctx }) => {
    return ctx.user !== null && ctx.user.id !== null;
  });

/** Get session user - used by client components */
export const getSessionUser = optionalAuthQuery
  .output(
    z.union([
      z.object({
        id: zid("user"),
        email: z.string(),
        image: z.string().nullable(),
        name: z.string(),
      }),
      z.null(),
    ]),
  )
  .query(async ({ ctx }) => {
    const user = ctx.user;
    console.log(user);

    if (!user) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      image: user.image ?? null,
      name: user.name,
    };
  });
