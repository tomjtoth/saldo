import { currentUser } from "./services/users";

type ServerFn<D, R> = (userId: number, data: D) => Promise<R>;
type ValidatorFn<RawD, D> = (rawData: D | RawD) => D | void;

function wrapService<RawD, D, R>(
  serverFn: ServerFn<D, R>,
  validatorFn: ValidatorFn<RawD, D>
): (data: RawD) => Promise<R>;

function wrapService<D, R>(serverFn: ServerFn<D, R>): (data: D) => Promise<R>;

function wrapService<RawD, D, R>(
  serverFn: ServerFn<D, R>,
  validatorFn?: ValidatorFn<RawD, D>
) {
  return async (data: RawD | D): Promise<R> => {
    const { id } = await currentUser();

    const validatedData = validatorFn
      ? validatorFn(data) ?? (data as D)
      : (data as D);

    return serverFn(id, validatedData);
  };
}
export default wrapService;
