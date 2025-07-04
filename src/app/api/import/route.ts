import { alreadyInProd, importV3 } from "@/lib/services/import-v3";

export const dynamic = "force-dynamic";

export async function POST() {
  if (await alreadyInProd())
    return new Response(null, {
      status: 403,
      statusText: "already in production",
    });

  try {
    const imported = await importV3();

    return Response.json(imported);
  } catch (err) {
    return new Response(null, {
      status: 400,
      statusText: (err as Error).message,
    });
  }
}
