import { v } from "convex/values";
import { defineEnt, defineEntSchema, getEntDefinitions } from "convex-ents";

const schema = defineEntSchema({
  user: defineEnt({
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Admin plugin
    role: v.optional(v.string()),
    banned: v.optional(v.boolean()),
    banReason: v.optional(v.string()),
    banExpires: v.optional(v.number()),
  })
    .index("email", ["email"])
    .edges("sessions", { to: "session", ref: "userId" })
    .edges("accounts", { to: "account", ref: "userId" }),

  session: defineEnt({
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    // Admin plugin
    impersonatedBy: v.optional(v.string()),
  })
    .index("token", ["token"])
    .edge("user", { to: "user", field: "userId" }),

  account: defineEnt({
    accountId: v.string(),
    providerId: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    idToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    password: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("accountId", ["accountId"])
    .edge("user", { to: "user", field: "userId" }),

  verification: defineEnt({
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("identifier", ["identifier"]),

  jwks: defineEnt({
    publicKey: v.string(),
    privateKey: v.string(),
    createdAt: v.number(),
  }),

  // Your other tables
});

export default schema;
export const entDefinitions = getEntDefinitions(schema);
