import type { GenericEnt, GenericEntWriter } from "convex-ents";
import { entsTableFactory, getEntDefinitions } from "convex-ents";
import type { TableNames } from "../functions/_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../functions/_generated/server";
import schema from "../functions/schema";

export const entDefinitions = getEntDefinitions(schema);

export type Ent<TableName extends TableNames> = GenericEnt<
  typeof entDefinitions,
  TableName
>;

export type EntWriter<TableName extends TableNames> = GenericEntWriter<
  typeof entDefinitions,
  TableName
>;

export type CtxWithTable<Ctx extends MutationCtx | QueryCtx> = Ctx & {
  table: ReturnType<typeof entsTableFactory<Ctx, typeof entDefinitions>>;
};
export const getCtxWithTable = <Ctx extends MutationCtx | QueryCtx>(
  ctx: Ctx,
) => ({
  ...ctx,
  table: entsTableFactory(ctx, entDefinitions),
});
