import { Item } from "@/app/receipts/_lib";

export const costToFixed = (item: Item, costAsNum?: number) => {
  if (costAsNum === undefined) costAsNum = Number(item.cost);
  return (isNaN(costAsNum) ? 0 : costAsNum).toFixed(2);
};
