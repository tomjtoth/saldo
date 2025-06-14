export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const log = (msg: string, err?: Error) =>
      console[err ? "error" : "log"](`\n\t${msg}\n`, err);

    const { migrator } = await import("./lib/models/db");

    log("DB migrations triggered");

    if (process.argv[2]?.toUpperCase() === "DOWN") {
      migrator
        .down()
        .then(() => log("reverting migration succeeded"))
        .catch((err) => log("reverting migration failed:", err));
    } else {
      migrator
        .up()
        .then(() => log("migration succeeded"))
        .catch((err) => log("migration failed:", err));
    }
  }
}
