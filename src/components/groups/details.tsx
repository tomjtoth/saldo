"use client";

import { TGroup } from "@/lib/models";
import { sendJSON } from "@/lib/utils";
import { toast } from "react-toastify";

export default function Details({ group }: { group: TGroup }) {
  let invDiv = null;

  if (group.Memberships![0].admin) {
    const invitationLink = group.uuid
      ? `${location.origin}/api/groups/${group.uuid}`
      : null;

    invDiv = (
      <>
        <h3>Invite more people</h3>

        <p className="text-center">
          As an admin of this group you can generate one invitation link at a
          time. The link expires on first use, but you can also revoke it.
        </p>

        {!!invitationLink && (
          <pre className="rounded border p-2 select-all">{invitationLink}</pre>
        )}

        <div className="flex gap-2 justify-evenly">
          {!!invitationLink && (
            <button
              onClick={() => {
                toast.promise(navigator.clipboard.writeText(invitationLink!), {
                  success: "Link copied to clipboard",
                  error: "Failed to copy invitation link to clipboard",
                });
              }}
            >
              Copy 🔗
            </button>
          )}

          <button
            onClick={() => {
              // TODO: refresh invitation link
            }}
          >
            Generate 🔁
          </button>

          {!!invitationLink && (
            <button
              onClick={() => {
                sendJSON(
                  `/groups/${group.id}`,
                  { uuid: null },
                  { method: "PUT" }
                );
              }}
            >
              Remove 🚫
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <div
      className={
        "absolute left-1/2 top-1/2 -translate-1/2 " +
        "max-w-min sm:max-w-4/5 max-h-4/5 overflow-scroll " +
        "rounded border p-2 flex flex-col items-center flex-wrap gap-2"
      }
    >
      <h2>{group.name}</h2>

      <h3>Current members</h3>

      <p>The below list of users belong to this group.</p>

      <ul>
        {group.Users?.map((user) => (
          <li key={user.id}>
            {user.name} {user.Membership?.admin && <sub>⭐</sub>} ({user.email})
          </li>
        ))}
      </ul>

      {invDiv}
    </div>
  );
}
