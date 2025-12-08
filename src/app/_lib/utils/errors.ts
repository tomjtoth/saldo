export class ErrorWithStatus extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message);
    this.status = status;
  }
}

type Opts = {
  status?: number;
  message?: string;
  info?: string;
  args?: { [key: string]: unknown };
};

type Overloads = {
  (opts: Opts): never;
  (message: string, args?: Omit<Opts, "message">): never;
  (status: number, args?: Omit<Opts, "status">): never;
};

export const err: Overloads = (
  intStrOrOpts: number | string | Opts,
  maybeOpts?: Opts
): never => {
  const opts = typeof intStrOrOpts === "object" ? intStrOrOpts : maybeOpts;

  const message =
    typeof intStrOrOpts === "string"
      ? intStrOrOpts
      : opts?.message ?? "access denied";

  const status = typeof intStrOrOpts === "number" ? intStrOrOpts : opts?.status;

  console.error(message);
  if (opts) console.error(opts);

  if (status) throw new ErrorWithStatus(status, message);
  throw new Error(message);
};
