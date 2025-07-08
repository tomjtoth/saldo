import CliRootDiv, { TRootDiv } from "./clientSide";
import Sidepanel from "../sidepanel";

export default async function RootDiv(srv: TRootDiv) {
  return <CliRootDiv sidepanel={<Sidepanel />} {...srv} />;
}
