import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/", label: "about" },
  { href: "/groups" },
  { href: "/categories" },
  { href: "/receipts" },
  { href: "/pareto" },
  { href: "/balance" },
];

const hrefToLabel = (href: string) => href.replaceAll(/\W+/g, "");

export default function ViewSelector() {
  const pathname = usePathname();
  const router = useRouter();

  const spanRef = useRef<HTMLSpanElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (spanRef.current && selectRef.current) {
      const width = spanRef.current.offsetWidth;
      selectRef.current.style.width = `${width + 20}px`;
    }
  }, [pathname]);

  const links = LINKS.map((a) => ({
    ...a,
    label:
      a.href === "/" && pathname === "/"
        ? "Saldo"
        : a.href === "/groups" && pathname !== "/groups"
        ? "group settings"
        : a.label ?? hrefToLabel(a.href),
  }));

  return (
    <>
      <span ref={spanRef} className="invisible absolute">
        {links.find((a) => a.href === pathname)?.label}
      </span>

      <select
        id="view-selector"
        ref={selectRef}
        defaultValue={pathname}
        className="no-spinner focus:outline-hidden cursor-pointer text-center"
        onChange={(ev) => router.push(ev.target.value)}
      >
        {links.map((a) => (
          <option key={a.href} value={a.href}>
            {a.label}
          </option>
        ))}
      </select>
    </>
  );
}
