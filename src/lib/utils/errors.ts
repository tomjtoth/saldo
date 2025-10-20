export class ErrorWithStatus extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message);
    this.status = status;
  }
}

type ErrorOverloads = {
  (status: number, message?: string): never;
  (message?: string): never;
};

export const err: ErrorOverloads = (
  intOrStr?: string | number,
  message?: string
): never => {
  if (typeof intOrStr === "string") throw new Error(intOrStr);
  if (typeof intOrStr === "number")
    throw new ErrorWithStatus(intOrStr, message);

  throw new Error();
};
