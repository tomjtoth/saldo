import {
  GeneratedCacheAdapter,
  Options,
  SqliteDriver,
} from "@mikro-orm/sqlite";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { User } from "./lib/entities/user";

const config: Options = {
  metadataProvider: TsMorphMetadataProvider,
  metadataCache: {
    enabled: true,
    adapter: GeneratedCacheAdapter,
    options: { data: require("./temp/metadata.json") },
  },

  entities: [User],
  // entitiesTs: ["./src/lib/entities/*.ts"],
  discovery: { disableDynamicFileAccess: true },

  driver: SqliteDriver,
  dbName: "data/mikro.db",

  // process.env.NODE_ENV === "test"
  //   ? ":memory:"
  //   : process.env.DB_PATH ||
  //     `data/${process.env.NODE_ENV === "production" ? "prod" : "dev"}.db`,
  debug: true,
};

export default config;
