"use server";

import { currentUser } from "../(users)/_lib";

type ServerFn<D, R> = (userId: number, data: D) => Promise<R>;

type ValidatorFn<RawD, D> = (
  rawData: D | RawD,
  userId: number
) => (D | void) | Promise<D | void>;

type Options = {
  returnsResult?: false;
};

function wrapService<RawD, D, R>(
  serverFn: ServerFn<D, R>,
  validatorFn: ValidatorFn<RawD, D>,
  options?: Options
): (data: RawD) => Promise<R>;

function wrapService<D, R>(
  serverFn: ServerFn<D, R>,
  options?: Options
): (data: D) => Promise<R>;

function wrapService<RawD, D, R>(
  serverFn: ServerFn<D, R>,
  optsOrFn?: ValidatorFn<RawD, D> | Options,
  maybeOpts?: Options
) {
  const opts =
    typeof maybeOpts === "object"
      ? maybeOpts
      : typeof optsOrFn === "object"
      ? optsOrFn
      : {};

  const validatorFn = typeof optsOrFn === "function" ? optsOrFn : undefined;

  return async (data: RawD | D): Promise<R | void> => {
    const { id } = await currentUser();

    const validatedData = validatorFn
      ? (await validatorFn(data, id)) ?? (data as D)
      : (data as D);

    const res = serverFn(id, validatedData);
    if (opts?.returnsResult ?? true) return res;
  };
}

export default wrapService;
