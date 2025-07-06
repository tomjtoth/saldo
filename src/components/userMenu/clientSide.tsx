"use client";

import { ReactNode, useState } from "react";

import Canceler from "../canceler";

export default function CliUserMenu({
  authenticated,
  signInButton,
  srvAvatar,
  srvMenu,
}: {
  authenticated: boolean;
  signInButton: ReactNode;
  srvAvatar: ReactNode;
  srvMenu: ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return !authenticated ? (
    signInButton
  ) : (
    <>
      <div
        id="user-avatar-container"
        className="w-10 h-10 overflow-hidden border-2 inline-block rounded-[50%] *:w-full *:h-full [&_img]:object-cover cursor-pointer shrink-0"
        onClick={() => setVisible(true)}
      >
        {srvAvatar}
      </div>
      {visible && (
        <Canceler onClick={() => setVisible(false)}>{srvMenu}</Canceler>
      )}
    </>
  );
}
