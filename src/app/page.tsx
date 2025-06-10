import Header from "@/components/header";

export default function HomePage() {
  return (
    <>
      <Header>
        <h2>Work in Progress</h2>
      </Header>

      <div className="p-2">
        <p>
          This is a <b>WiP</b> multi-user expense tracker app.
        </p>

        {process.env.GIT_HASH && (
          <p>
            This version is deployed from:{" "}
            <code>{process.env.GIT_HASH.substring(0, 7)}</code>.
          </p>
        )}
      </div>
    </>
  );
}
