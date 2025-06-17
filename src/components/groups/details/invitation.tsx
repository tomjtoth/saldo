"use client";

import { TGroup } from "@/lib/models";
import { err, sendJSON, toastifyMsgs } from "@/lib/utils";
import { toast } from "react-toastify";

export default function Invitation({ group }: { group: TGroup }) {
  const isAdmin = group.Memberships![0].admin;
  const invitationLink = group.uuid
    ? `${location.origin}/api/groups/${group.uuid}`
    : null;

  return isAdmin ? (
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
            toast.promise(
              sendJSON(
                `/api/groups/${group.id}`,
                { generateLink: true },
                { method: "PUT" }
              ).then((res) => {
                if (!res.ok) err();
              }),
              toastifyMsgs("Generating invitation link")
            );
          }}
        >
          Generate 🔁
        </button>

        {!!invitationLink && (
          <button
            onClick={() => {
              toast.promise(
                sendJSON(
                  `/api/groups/${group.id}`,
                  { removeLink: true },
                  { method: "PUT" }
                ).then((res) => {
                  if (!res.ok) err();
                }),
                toastifyMsgs("Deleting invitation link")
              );
            }}
          >
            Remove 🚫
          </button>
        )}
      </div>
    </>
  ) : null;
}
