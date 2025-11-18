import { Category } from "@/app/categories/_lib";
import { createContext, useContext } from "react";

export const ConsumptionCx = createContext<{
  [catId: Category["id"]]: Category["name"];
}>({});

export const useConsumptionCx = () => useContext(ConsumptionCx);
