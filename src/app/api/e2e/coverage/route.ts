import wrapRoute from "@/app/_lib/wrapRoute";

export const GET = wrapRoute(
  { onlyDuringDevelopment: true, requireSession: false },
  async () =>
    Response.json({
      coverage: global.__coverage__ || null,
    })
);
