import Link from "next/link";

const LINKS = [
  { href: "/categories" },
  { href: "/receipts" },
  { href: "/pareto" },
  { href: "/balance" },
];

export const hrefToLabel = (href: string) => href.replaceAll(/\W+/g, "");

export default function ViewListing({ prefix = "" }: { prefix?: string }) {
  return (
    <ul className="pl-10">
      {LINKS.map((a) => (
        <li key={a.href}>
          <Link href={prefix + a.href}>{hrefToLabel(a.href)}</Link>
        </li>
      ))}
    </ul>
  );
}
