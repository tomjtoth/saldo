import CliRootDiv, { TSrv } from "./clientSide";
import UserMenu from "../user-menu";

export default function RootDiv(srv: TSrv) {
  return <CliRootDiv userMenu={<UserMenu />} {...srv} />;
}
