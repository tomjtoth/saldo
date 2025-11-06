import Link from "next/link";

export default function HashParagraph() {
  let pHash = null;

  if (process.env.GIT_HASH) {
    const hash = process.env.GIT_HASH;
    pHash = (
      <p>
        This version is deployed from:{" "}
        <Link
          href={`https://github.com/tomjtoth/saldo/commit/${hash}`}
          target="_blank"
        >
          <code>{hash.substring(0, 7)}</code>
        </Link>
        .
      </p>
    );
  }

  return pHash;
}
