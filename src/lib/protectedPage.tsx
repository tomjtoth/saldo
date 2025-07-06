import { ReactNode } from "react";

import { Group, TGroup } from "./models";
import { auth, signIn } from "@/auth";
import { currentUser } from "@/lib/services/user";

import RootDiv from "@/components/rootDiv";

type TCoreParams = { groupId?: string };
export type TPage<T = object> = { params: Promise<TCoreParams & T> };

type ProtectedPageOptions<T> = {
  params: TPage<T>["params"];
  resolveParams?: (params: TCoreParams & T) => {
    redirectTo: string;
    groupId?: number;
  };
  getData: (userId: number) => Promise<(Group | TGroup)[]>;
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

  const user = await currentUser(session);
  const groups = await getData(user.id);

  return (
    <RootDiv
      {...{
        userId: user.id,
        defaultGroupId: user.defaultGroupId,
        groupId,
        groups: (groups as (Group | TGroup)[]).map((group) =>
          "get" in group ? group.get({ plain: true }) : group
        ),
        rewritePath,
      }}
    >
      {children}
    </RootDiv>
  );
}
