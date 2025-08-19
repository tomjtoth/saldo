import RootDiv from "@/components/rootDiv";
import Header from "@/components/header";
import HashParagraph from "@/components/hashParagraph";
import ImportSection from "@/components/import";

export default function HomePage() {
  return (
    <RootDiv>
      <Header>
        <h2>Saldo</h2>
      </Header>

      <div className="p-2">
        <p>
          This is a multi-user expense tracker app. Most revisions of records
          are archived and can be viewed by users related to them, but deletion
          is not supported only setting an{" "}
          <span className="p-1 rounded border-2 border-red-500">INACTIVE</span>{" "}
          status.
        </p>

        <HashParagraph />

        <ImportSection />
      </div>
    </RootDiv>
  );
}
