import protectedRoute from "@/lib/protectedRoute";
import { populateDb } from "../(utils)";

export const GET = protectedRoute(
  { requireSession: false, onlyDuringDevelopment: true },
  async () => await populateDb()
);
