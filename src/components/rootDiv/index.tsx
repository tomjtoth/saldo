import CliRootDiv, { TSrv } from "./clientSide";
import UserMenu from "../userMenu";

export default function RootDiv(srv: TSrv) {
  return <CliRootDiv userMenu={<UserMenu />} {...srv} />;
}
