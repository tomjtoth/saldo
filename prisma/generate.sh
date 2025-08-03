#!/bin/bash

DATABASE_URL=file:../data/dev.db \
  npx prisma generate

IN=./prisma/schema.prisma
OUT=./src/lib/db/types.ts

TYPES=$(grep -Po '(?<=model )(?!Meta)\w+' $IN |  tr '\n' ',')

sed -E '
1 {
  i // THIS FILE GETS OVERWRITTEN, DO NOT EDIT it
  i // invoke ./prisma/generate.sh upon schema changes
  i
  i import { '"$TYPES"' } from "@prisma/client";
  i import { TBalanceChartData } from "@/components/balance/chart";
  i import { TParetoChartData } from "@/components/pareto/chart";
  i
  i export type { '"$TYPES"' }
  i
  i export interface TRevision { createdOn?: string }
  i
  i export interface TReceipt { paidOn?: string }
  i
  i export interface TMembership { admin?: boolean }
  i
  i export interface TGroup {
  i   balance?: TBalanceChartData;
  i   pareto?: TParetoChartData;
  i }
  i
}
1,/\/\/ SED-MARKER/d;                                       # Delete everything until the marker
s/@.*//;                                                    # Remove everything after @
s/\?//;                                                     # Remove all question marks
s/model (\w+)/export interface T\1 extends Partial<\1>/;    # Begin interface definition
/^\s*\S+\s+(Int|String|Json|Bytes)\>/d;                     # Remove basic types
s/^\s+(\S+)\s+(\S+) */\1?: T\2,/m;                          # Format properties
' $IN > "$OUT"

# TODO: make auto-formatting the created file work, this wouldn't work...
# npx eslint "$OUT" --fix

