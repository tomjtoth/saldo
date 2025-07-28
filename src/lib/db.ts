import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { MikroORM, RequestContext } from "@mikro-orm/sqlite";

import config from "@/mikro-orm.config";

export const withORM =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const orm = await getORM();
    return RequestContext.create(orm.em, async () => handler(req, res));
  };

export const getORM = async () => {
  const gt = globalThis as { __MikroORM__?: MikroORM };

  if (!gt.__MikroORM__)
    gt.__MikroORM__ = await MikroORM.init(config).then(async (orm) => {
      if (config.dbName === ":memory:") {
        const generator = orm.getSchemaGenerator();
        await generator.createSchema().catch();
      }

      return orm;
    });

  return gt.__MikroORM__!;
};
