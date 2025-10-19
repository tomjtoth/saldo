// REMINDER: any static imports and their transient dependencies
// must be compatible with the edge runtime

export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    (process.env.NODE_ENV === "production" || process.env.MIGRATE)
  ) {
    const TAB = "\t";
    const LF = "\n\n";

    const { migrator } = await import("@/lib/db");

    const res = await migrator.up().catch((err: Error) => {
      console.error(LF, TAB, "Migration failed:", LF, err.message, LF);
      process.exit(1);
    });

    const len = res.length;

    if (len > 0)
      console.log(
        LF,
        TAB,
        `${len > 1 ? `${len} migrations` : `Migration "${res[0]}"`} succeeded.`,
        LF
      );
  }
}
