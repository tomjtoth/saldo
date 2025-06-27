import Header from "@/components/header";
import UserMenu from "@/components/user-menu";
import CliPwa from "@/components/pwa";
import HashParagraph from "@/components/hash-paragraph";

export default function HomePage() {
  const userMenu = <UserMenu />;

  return (
    <>
      <Header userMenu={userMenu}>
        <h2>Work in Progress</h2>
      </Header>

      <div className="p-2">
        <p>
          This is a <b>WiP</b> multi-user expense tracker app. Most changes to
          records are archived and can be viewed by related users, deletion of
          records is not supported only marking them as <i>INACTIVE</i>.
        </p>

        <HashParagraph />
      </div>

      <CliPwa />
    </>
  );
}
