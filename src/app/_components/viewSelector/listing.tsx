import Link from "next/link";

import { useBodyNodes } from "../../_lib/hooks";

export const LINKS = [
  { href: "/", label: "about" },
  { href: "/groups" },
  { href: "/categories" },
  { href: "/receipts" },
  { href: "/pareto" },
  { href: "/balance" },
];

export const hrefToLabel = (href: string) => href.replaceAll(/\W+/g, "");

export default function ViewSelectorListing({
  prefix = "",
  className: cn = "",
}: {
  className?: string;
  prefix?: string;
}) {
  const nodes = useBodyNodes();
  const lastIdx = LINKS.length - 1;

  return (
    <ul className={cn}>
      {LINKS.map((a, idx) => {
        return a.href === "/" ? null : (
          <li key={a.href}>
            {idx === lastIdx ? "└ " : "├ "}
            <Link href={prefix + a.href} onClick={nodes.pop}>
              {a.label ?? hrefToLabel(a.href)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
