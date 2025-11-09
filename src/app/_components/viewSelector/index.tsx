import { usePathname } from "next/navigation";

import { useBodyNodes, useClientState } from "../../_lib/hooks";
import { hrefToLabel } from "./listing";

import MainMenu from "../mainMenu";

export default function ViewSelector() {
  const cs = useClientState();
  const nodes = useBodyNodes();
  const pathname = usePathname();

  return (
    <span
      className="truncate cursor-pointer min-w-10"
      onClick={() => !!cs.user && nodes.push(MainMenu)}
    >
      {pathname === "/" ? "Saldo" : hrefToLabel(pathname)}
    </span>
  );
}
