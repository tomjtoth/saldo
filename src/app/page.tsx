import wrapPage from "@/app/_lib/wrapPage";

import Header from "@/app/_components/header";
import HashParagraph from "@/app/_components/hashParagraph";
import ImportSection from "./(import)";

export default wrapPage({
  requireSession: false,

  children() {
    return (
      <>
        <Header />

        <div className="p-2">
          <p>
            This is a multi-user expense tracker app. Most revisions of records
            are archived and can be viewed by users related to them, but
            deletion is not supported only setting an{" "}
            <span className="p-1 rounded border-2 border-red-500">
              INACTIVE
            </span>{" "}
            status.
          </p>

          <HashParagraph />

          <ImportSection />
        </div>
      </>
    );
  },
});
