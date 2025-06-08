"use client";

import { useState } from "react";

import { CANCELER_CLASSES } from "..";

export default function CliUserMenu({
  authenticated,
  signInButton,
  srvAvatar,
  srvMenu,
}: {
  authenticated: boolean;
  signInButton: React.ReactNode;
  srvAvatar: React.ReactNode;
  srvMenu: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return !authenticated ? (
    signInButton
  ) : (
    <>
      <div
        className="w-10 h-10 overflow-hidden border-2 inline-block rounded-[50%] *:w-full *:h-full [&_img]:object-cover cursor-pointer"
        onClick={() => setVisible(true)}
      >
        {srvAvatar}
      </div>
      {visible && (
        <>
          <div
            className={CANCELER_CLASSES}
            onClick={(ev) => {
              if (ev.target === ev.currentTarget) setVisible(false);
            }}
          />{" "}
          {srvMenu}
        </>
      )}
    </>
  );
}
