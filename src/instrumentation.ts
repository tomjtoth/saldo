// REMINDER: any static imports and their transient dependencies
// must be compatible with the edge runtime

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const TAB = "\t";
    const LF = "\n\n";

    const { migrator } = await import("./lib/models/db");

    migrator
      .up()
      .then((res) => {
        if (res.length > 0)
          console.log(
            LF,
            TAB,
            `${
              res.length > 1 ? +`${res.length} migrations` : "Migration"
            } succeeded.`,
            LF
          );
      })
      .catch((err) => console.error(LF, TAB, "Migration failed:", LF, err, LF));
  }
}
