import { ReactNode } from "react";

import { TGroup } from "./db";
import { currentUser } from "@/lib/services/users";

import RootDiv from "@/components/rootDiv";

type WithGId<T = object> = T & { groupId?: string };

interface BaseOptions<T, R = WithGId<T>> {
  resolveParams?: (params: R) => R & { redirectTo: string };
  getData: (userId: number) => Promise<TGroup[]>;
  rewritePath: string;
}

interface WithExplicitChildren<T> extends BaseOptions<T> {
  children: ReactNode;
}

interface WithGeneratedChildren<T> extends BaseOptions<T> {
  genChildren: (cx: WithGId<T>) => ReactNode;
}

type RequestContext<T> = { params: Promise<WithGId<T>> };

type Signature<T> = (cx: RequestContext<T>) => Promise<ReactNode>;

function protectedPage<T = object>(args: WithExplicitChildren<T>): Signature<T>;

function protectedPage<T = object>(
  args: WithGeneratedChildren<T>
): Signature<T>;

function protectedPage<T = object>({
  resolveParams,
  getData,
  rewritePath,
  ...rest
}: WithExplicitChildren<T> | WithGeneratedChildren<T>) {
  const protectedPageHandler = async (cx: RequestContext<T>) => {
    const resolveCoreParams = ({ groupId }: WithGId) => ({
      redirectTo: `${groupId ? `/groups/${groupId}` : ""}${rewritePath}`,
      groupId,
    });

    const params = await cx.params;

    const { redirectTo, groupId } = (resolveParams ?? resolveCoreParams)(
      params
    );

    const user = await currentUser({ redirectTo });
    const groups = await getData(user.id);

    const children =
      "children" in rest ? rest.children : rest.genChildren(params);

    const gidAsNum = Number(groupId);

    return (
      <RootDiv
        {...{
          user,
          groupId: isNaN(gidAsNum) ? undefined : gidAsNum,
          groups,
          rewritePath,
        }}
      >
        {children}
      </RootDiv>
    );
  };

  return protectedPageHandler;
}

export default protectedPage;
