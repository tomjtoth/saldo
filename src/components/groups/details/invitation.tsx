"use client";

import { toast } from "react-toastify";

import { useAppDispatch } from "@/lib/hooks";
import { TGroup } from "@/lib/db";
import { appToast } from "@/lib/utils";
import { rCombined as red } from "@/lib/reducers";
import {
  svcGenerateInviteLink,
  svcRemoveInviteLink,
} from "@/lib/services/groups";

export default function Invitation({
  group,
  clientIsAdmin,
}: {
  group: TGroup;
  clientIsAdmin: boolean;
}) {
  const dispatch = useAppDispatch();
  const invitationLink = group.uuid
    ? `${location.origin}/join/${group.uuid}`
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

  return clientIsAdmin ? (
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
              svcGenerateInviteLink(group.id!).then((res) =>
                dispatch(red.updateGroup(res))
              ),
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
                svcRemoveInviteLink(group.id!).then((res) => {
                  dispatch(red.updateGroup(res));
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
