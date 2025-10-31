import { ReactNode } from "react";

import { TGroup } from "./db";
import { currentUser } from "@/app/_lib/services/users";

import RootDiv from "@/app/_components/rootDiv";

type WithGID<T = object> = T & { groupId?: string };

interface BaseOptions<T, R = WithGID<T>> {
  resolveParams?: (params: R) => R & { redirectTo: string };
  rewritePath?: string;
  children?: ReactNode | ((cx: WithGID<T>) => ReactNode);
}

interface WithoutSession<T> extends BaseOptions<T> {
  requireSession: false;
}

interface WithData<T> extends BaseOptions<T> {
  getData?: (userId: number) => Promise<TGroup[]>;
}

type RequestContext<T> = { params: Promise<WithGID<T>> };

type Signature<T> = (cx: RequestContext<T>) => Promise<ReactNode>;

function wrapPage<T = object>(args: WithData<T>): Signature<T>;
function wrapPage<T = object>(args: WithoutSession<T>): Signature<T>;

function wrapPage<T = object>({
  resolveParams,
  rewritePath,
  children,
  ...rest
}: WithData<T> | WithoutSession<T>): Signature<T> {
  const pageHandler = async (cx: RequestContext<T>) => {
    const requireSession = "requireSession" in rest ? false : true;

    const resolveCoreParams = ({ groupId }: WithGID) => ({
      redirectTo: `${groupId ? `/groups/${groupId}` : ""}${rewritePath}`,
      groupId,
    });

    const resolver = resolveParams ?? resolveCoreParams;
    const params = await cx.params;
    const { groupId: resolvedGroupId } = resolver(params);
    const gidAsNum = Number(resolvedGroupId);

    const user = requireSession
      ? await currentUser()
      : await currentUser({ requireSession });

    const groups =
      user && "getData" in rest && rest.getData
        ? await rest.getData(user.id)
        : [];

    return (
      <RootDiv
        {...{
          user,
          groupId: isNaN(gidAsNum) ? undefined : gidAsNum,
          groups,
          rewritePath,
        }}
      >
        {typeof children === "function" ? children(params) : children ?? null}
      </RootDiv>
    );
  };

  return pageHandler;
}

export default wrapPage;
