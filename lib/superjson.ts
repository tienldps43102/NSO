import SuperJSON from "superjson";
import { Prisma } from "./generated/prisma/client";

// Prisma.Decimal is a class -> register custom serializer
SuperJSON.registerCustom<Prisma.Decimal, string>(
  {
    isApplicable: (v): v is Prisma.Decimal => v instanceof Prisma.Decimal,
    serialize: (v) => v.toString(),
    deserialize: (v) => Number(v) as any,
  },
  "PrismaDecimal",
);

export default SuperJSON;
