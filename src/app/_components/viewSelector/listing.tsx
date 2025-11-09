import Link from "next/link";

export const LINKS = [
  { href: "/categories", emoji: "🛍️" },
  { href: "/receipts", emoji: "🧾" },
  { href: "/pareto", emoji: "📊" },
  { href: "/balance", emoji: "📈" },
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
          {a.emoji} <Link href={prefix + a.href}>{hrefToLabel(a.href)}</Link>
        </li>
      ))}
    </ul>
  );
}
