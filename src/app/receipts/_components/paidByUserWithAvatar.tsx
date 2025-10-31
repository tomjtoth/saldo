import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { rCombined } from "@/lib/reducers";
import { TUser } from "@/lib/db";
import { useBodyNodes } from "@/app/_components/bodyNodes";

import UserAvatar from "@/app/_components/userAvatar";
import Canceler from "@/app/_components/canceler";

export default function PaidByUserWithAvatar({
  listOnClick,
  ...user
}: TUser & {
  listOnClick?: true;
}) {
  const nodes = useBodyNodes();

  return (
    <div
      className={listOnClick && "cursor-pointer"}
      onClick={
        listOnClick
          ? () => nodes.push(<Listing key="paid-by-listing" />)
          : undefined
      }
    >
      <span className="hidden sm:inline-block mr-2">paid by</span>
      <span className="hidden lg:inline-block mr-2">{user.name}</span>
      <UserAvatar {...user} className="w-10" />
    </div>
  );
}

function Listing() {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector();
  const nodes = useBodyNodes();

  return (
    <Canceler onClick={nodes.pop}>
      <ul
        className={
          "absolute z-3 left-1/2 top-1/2 -translate-1/2 " +
          "flex flex-col gap-4"
        }
      >
        {rs.users?.map((u) => (
          <li
            key={u.id}
            className="cursor-pointer"
            onClick={() => {
              dispatch(rCombined.setPaidBy(u.id!));
              nodes.pop();
            }}
          >
            <UserAvatar {...u} className="mr-2 w-10" />
            {u.email}
          </li>
        ))}
      </ul>
    </Canceler>
  );
}
