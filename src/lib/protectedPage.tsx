import { ReactNode } from "react";

import { Group, TGroup } from "./models";
import { auth, signIn } from "@/auth";
import { currentUser } from "@/lib/services/user";

import RootDiv from "@/components/rootDiv";

export type TCoreParams = { params: { groupId?: string } };

type ProtectedPageOptions<TPageParams> = {
  params: TPageParams;
  resolveParams?: (params: TPageParams) => {
    redirectTo: string;
    groupId?: number;
  };
  getData: (userId: number) => Promise<(Group | TGroup)[]>;
  children: ReactNode;
  rewritePath: string;
};

export default async function protectedPage<
  TPageParams extends { groupId?: string }
>({
  params,
  resolveParams,
  getData,
  children,
  rewritePath,
}: ProtectedPageOptions<TPageParams>) {
  const resolveCoreParams = ({ groupId }: { groupId?: string }) => {
    const gidAsNum = Number(groupId);
    const prefix = groupId ? `/groups/${groupId}` : "";

    return {
      redirectTo: prefix + rewritePath,
      groupId: isNaN(gidAsNum) ? undefined : gidAsNum,
    };
  };

  const { redirectTo, groupId } = (resolveParams ?? resolveCoreParams)(params);

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
