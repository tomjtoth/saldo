import { currentUser } from "./services/users";

export default function wrapService<O, R>(
  serverFn: (userId: number, opts: O) => Promise<R>
) {
  async function serviceFn(opts: O) {
    const { id } = await currentUser();
    return await serverFn(id, opts);
  }

  return serviceFn;
}
