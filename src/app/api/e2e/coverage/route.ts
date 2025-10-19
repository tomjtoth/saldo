import protectedRoute from "@/lib/protectedRoute";

export const GET = protectedRoute(
  { onlyDuringDevelopment: true, requireSession: false },
  async () =>
    Response.json({
      coverage: global.__coverage__ || null,
    })
);
