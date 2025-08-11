import { PrismaClient } from "@prisma/client";

export * from "./types";
export { migrator } from "./migrator";
export { atomic } from "./atomic";
export { updater } from "./updater";
export { getArchivePopulator } from "./archives";

// client extensions should not be used, as they choke Next.js with unserializable data
// implemented fn asPlain() => JSON.parse(JSON.stringify(obj)), but seems like a waste of resources
// https://github.com/prisma/prisma/issues/20627

export const db = new PrismaClient({ log: ["query"] });
