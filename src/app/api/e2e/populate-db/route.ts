import wrapRoute from "@/lib/wrapRoute";
import { populateDb } from "../(utils)";

export const GET = wrapRoute(
  { requireSession: false, onlyDuringDevelopment: true },
  async () => await populateDb()
);
