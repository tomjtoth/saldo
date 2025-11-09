import Link from "next/link";

const LINKS = [
  { href: "/categories" },
  { href: "/receipts" },
  { href: "/pareto" },
  { href: "/balance" },
];

export const hrefToLabel = (href: string) => href.replaceAll(/\W+/g, "");

export default function ViewListing({
  prefix = "",
  decorate,
}: {
  prefix?: string;
  decorate?: true;
}) {
  const lastIdx = LINKS.length - 1;

  return (
    <ul>
      {LINKS.map((a, idx) => (
        <li key={a.href}>
          {decorate && (idx === lastIdx ? "└ " : "├ ")}
          <Link href={prefix + a.href}>{hrefToLabel(a.href)}</Link>
        </li>
      ))}
    </ul>
  );
}
