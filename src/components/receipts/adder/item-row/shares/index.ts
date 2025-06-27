import { TCliItem } from "@/lib/reducers";

export const costToFixed = (item: TCliItem, costAsNum?: number) => {
  if (costAsNum === undefined) costAsNum = Number(item.cost);
  return (isNaN(costAsNum) ? 0 : costAsNum).toFixed(2);
};
