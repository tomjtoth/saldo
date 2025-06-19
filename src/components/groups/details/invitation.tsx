"use client";

import { toast } from "react-toastify";

import { useAppDispatch } from "@/lib/hooks";
import { TGroup } from "@/lib/models";
import { err, sendJSON, appToast } from "@/lib/utils";
import { rGroups } from "@/lib/reducers/groups";

export default function Invitation({ group }: { group: TGroup }) {
  const dispatch = useAppDispatch();
  const isAdmin = group.Memberships![0].admin;
  const invitationLink = group.uuid
    ? `${location.origin}/api/groups/${group.uuid}`
    : null;

  const copyToClipboard = () =>
    toast.promise(
      navigator.clipboard.writeText(invitationLink!),
      {
        success: "Link copied to clipboard",
        error: "Failed to copy invitation link to clipboard",
      },
      appToast.theme()
    );

  return isAdmin ? (
    <>
      <h3>Invite more people</h3>

      <p className="text-center">
        As an admin of this group you can generate one invitation link at a
        time. The link expires on first use, but you can also revoke it.
      </p>

      {!!invitationLink && (
        <p
          className="rounded border p-2 select-all text-center"
          onCopy={(ev) => {
            ev.preventDefault();
            copyToClipboard();
          }}
        >
          {invitationLink.replace(/-/g, "-\u200b")}
        </p>
      )}

      <div className="flex gap-2 justify-evenly">
        {!!invitationLink && <button onClick={copyToClipboard}>Copy 🔗</button>}

        <button
          onClick={() => {
            appToast.promise(
              sendJSON(
                "/api/groups",
                { id: group.id, generateLink: true },
                { method: "PUT" }
              ).then(async (res) => {
                if (!res.ok) err(res.statusText);

                const body = await res.json();
                dispatch(rGroups.update(body));
              }),
              "Generating invitation link"
            );
          }}
        >
          Generate 🔁
        </button>

        {!!invitationLink && (
          <button
            onClick={() => {
              appToast.promise(
                sendJSON(
                  "/api/groups",
                  { id: group.id, removeLink: true },
                  { method: "PUT" }
                ).then(async (res) => {
                  if (!res.ok) err(res.statusText);

                  const body = await res.json();
                  dispatch(rGroups.update(body));
                }),
                "Deleting invitation link"
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
