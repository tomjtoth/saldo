import { usePathname } from "next/navigation";

import { useBodyNodes, useClientState } from "../../_lib/hooks";
import { hrefToLabel } from "./listing";

import MainMenu from "../mainMenu";

export default function ViewSelector() {
  const user = useClientState("user");
  const nodes = useBodyNodes();
  const pathname = usePathname();

  return (
    <span
      className="truncate cursor-pointer min-w-10 select-none"
      onClick={() => !!user && nodes.push(MainMenu)}
    >
      {pathname === "/" ? "Saldo" : hrefToLabel(pathname)}
    </span>
  );
}
