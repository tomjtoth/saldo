// #!/bin/bash

import fs from "fs";
import { execSync } from "child_process";

execSync(`DATABASE_URL="${process.env.DATABASE_URL}" npx prisma generate`, {
  stdio: "inherit",
  shell: "/bin/bash",
  cwd: process.cwd(),
});

const schema = fs.readFileSync("./prisma/schema.prisma", "utf-8");

const omit = ["Revision", "Archive"];

const res = [
  // trim everything before the marker
  [/^.+\/\/ RELEVANT MODELS BELOW/gs],

  // remove all "@" directives and "?"
  [/@.+$|\?/gm],

  // remove all base types
  [/^\s*\S+\s+(Int|String|Json|Bytes)\??\s*$\n/gm],

  [
    /model (\w+) \{/g,
    (_: string, model: string) => {
      const repl =
        // transform model defs into exports
        `export interface T${model} extends Partial<${model}> {` +
        // inject archives to any model, but 2
        (omit.includes(model) ? "" : `\n  archives ${model}[]\n`);

      return repl;
    },
  ],

  // transform relation lines into interface props
  [/^\s+((?!export)\S+)\s+((?!export)\S+)\s*?/gm, "$1?: T$2,"],
].reduce(
  (res, [patt, repl = ""], idx) =>
    res.replaceAll(patt as RegExp, repl as string),
  schema
);

const types = res
  .matchAll(/(?<=export interface T)\w+/g)
  .map((m) => m[0])
  .toArray()
  .join(", ");

fs.writeFileSync(
  "./src/lib/db/types.ts",
  `\
// THIS FILE GETS OVERWRITTEN, DO NOT EDIT it
// invoke ./prisma/generate.sh upon schema changes

import { ${types} } from "@prisma/client";
import { TBalanceChartData } from "@/components/balance/chart";
import { TParetoChartData } from "@/components/pareto/chart";

export type { ${types} };

export interface TRevision { createdOn?: string }

export interface TReceipt { paidOn?: string }

export interface TMembership { admin?: boolean }

export interface TGroup {
  balance?: TBalanceChartData;
  pareto?: TParetoChartData;
}

${res}`
);

// # TODO: make auto-formatting the created file work, this wouldn't work...
// # npx eslint "$OUT" --fix
