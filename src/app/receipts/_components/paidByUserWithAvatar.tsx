import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";
import { User } from "@/app/(users)/_lib";

import UserAvatar from "@/app/_components/userAvatar";
import Canceler from "@/app/_components/canceler";

export default function PaidByUserWithAvatar({
  id,
  userId,
  listOnClick,
}: {
  id?: string;
  userId: User["id"];
  listOnClick?: true;
}) {
  const nodes = useBodyNodes();
  const user = useClientState("users[id]")[userId];

  return (
    <div
      {...(id ? { id } : {})}
      className={listOnClick && "cursor-pointer"}
      onClick={listOnClick ? () => nodes.push(Listing) : undefined}
    >
      <span className="hidden sm:inline-block mr-2">paid by</span>
      <span className="hidden lg:inline-block mr-2">{user?.name}</span>
      <UserAvatar userId={userId} className="w-10" />
    </div>
  );
}

function Listing() {
  const dispatch = useAppDispatch();
  const users = useClientState("users");
  const nodes = useBodyNodes();

  return (
    <Canceler onClick={nodes.pop}>
      <ul
        className={
          "absolute z-3 left-1/2 top-1/2 -translate-1/2 " +
          "flex flex-col gap-4"
        }
      >
        {users.map((u) => (
          <li
            key={u.id}
            className="cursor-pointer"
            onClick={() => {
              dispatch(thunks.setPaidBy(u.id));
              nodes.pop();
            }}
          >
            <UserAvatar userId={u.id} className="mr-2 w-10" />
            {u.email}
          </li>
        ))}
      </ul>
    </Canceler>
  );
}
