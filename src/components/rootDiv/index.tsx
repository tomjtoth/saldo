import CliRootDiv, { TRootDiv } from "./clientSide";
import UserMenu from "../userMenu";

export default function RootDiv(srv: TRootDiv) {
  return <CliRootDiv userMenu={<UserMenu />} {...srv} />;
}
