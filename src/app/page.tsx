import Link from "next/link";

export default function Home() {
  return (
    <>
      <h2>Work in Progress</h2>
      <p>
        This <s className="text-gray-300">is</s> will be a multi-user expense
        tracker app. Go to the <Link href="/import">import view</Link>.
      </p>
      {process.env.GIT_HASH && (
        <p>
          This version is deployed from: <code>{process.env.GIT_HASH}</code>.
        </p>
      )}
    </>
  );
}
