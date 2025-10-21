// REMINDER: any static imports and their transient dependencies
// must be compatible with the edge runtime

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.NODE_ENV === "production" || process.env.MIGRATE) {
      const { migrator } = await import("@/lib/db");
      await migrator.up();
    }

    
  }
}
