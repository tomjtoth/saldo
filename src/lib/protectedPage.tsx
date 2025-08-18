import { ReactNode } from "react";

import { TGroup } from "./db";
import { auth, signIn } from "@/auth";
import { currentUser } from "@/lib/services/user";

import RootDiv from "@/components/rootDiv";

type TCoreParams = { groupId?: string };
type TPageParams<T> = TCoreParams & T;
export type TPage<T = object> = { params: Promise<TPageParams<T>> };

type ProtectedPageOptions<T> = {
  params: TPage<T>["params"];
  resolveParams?: (params: TPageParams<T>) => {
    redirectTo: string;
    groupId?: number;
  };
  getData: (userId: number) => Promise<TGroup[]>;
  children: ReactNode;
  rewritePath: string;
};

export default async function protectedPage<T = object>({
  params,
  resolveParams,
  getData,
  children,
  rewritePath,
}: ProtectedPageOptions<T>) {
  const resolveCoreParams = ({ groupId }: TCoreParams) => {
    const gidAsNum = Number(groupId);
    const prefix = groupId ? `/groups/${groupId}` : "";

    return {
      redirectTo: prefix + rewritePath,
      groupId: isNaN(gidAsNum) ? undefined : gidAsNum,
    };
  };

  const { redirectTo, groupId } = (resolveParams ?? resolveCoreParams)(
    await params
  );

  const session = await auth();
  if (!session) return signIn("", { redirectTo });

  const { id, statusId, defaultGroupId } = await currentUser(session);
  const groups = await getData(id);

  return (
    <RootDiv
      {...{
        user: { id, statusId },
        defaultGroupId: defaultGroupId ?? undefined,
        groupId,
        groups,
        rewritePath,
      }}
    >
      {children}
    </RootDiv>
  );
}
