export class ErrorWithStatus extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message);
    this.status = status;
  }
}

export type ErrOpts = {
  status?: number;
  message?: string;
  info?: string;
  args?: { [key: string]: unknown };
};

type Overloads = {
  (opts: ErrOpts): never;
  (message: string, args?: Omit<ErrOpts, "message">): never;
  (status: number, args?: Omit<ErrOpts, "status">): never;
};

export const err: Overloads = (
  intStrOrOpts: number | string | ErrOpts,
  maybeOpts?: ErrOpts
): never => {
  const opts = typeof intStrOrOpts === "object" ? intStrOrOpts : maybeOpts;

  const message =
    typeof intStrOrOpts === "string"
      ? intStrOrOpts
      : opts?.message ?? "access denied";

  const status = typeof intStrOrOpts === "number" ? intStrOrOpts : opts?.status;

  console.error("\n\tERROR: %s\n", message);
  if (opts) {
    if ("message" in opts) delete opts.message;
    console.error(opts);
  }

  if (status) throw new ErrorWithStatus(status, message);
  throw new Error(message);
};
