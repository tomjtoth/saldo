import { useRootDivCx } from "@/components/rootDiv/clientSide";
import { ReactNode, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";

const SCROLLERS = `SCROLLERS-${uuid()}`;

export default function Scrollers() {
  const { rootDivRef, addOnScroll, rmOnScroll } = useRootDivCx();

  const visible = useRef(false);
  const [rendered, setRendered] = useState<ReactNode>(null);

  const scrollRootDiv = (dy: number) => {
    const div = rootDivRef!.current!;
    const newTop = dy === 0 ? 0 : div.scrollTop + dy;
    div.scroll(0, Math.max(0, Math.min(newTop, div.scrollHeight)));
  };

  const node = (
    <>
      <div className="min-h-20"></div>
      <div className="absolute bottom-10 right-10 [&>button]:bg-background flex flex-col sm:flex-row gap-2">
        <button onClick={() => scrollRootDiv(0)}>🔝</button>
        <button onClick={() => scrollRootDiv(-2000)}>⬆️</button>
        <button onClick={() => scrollRootDiv(2000)}>⬇️</button>
      </div>
    </>
  );

  useEffect(() => {
    addOnScroll(SCROLLERS, ({ currentTarget: { scrollTop } }) => {
      if (!visible.current && scrollTop > 2000) {
        visible.current = true;
        setRendered(node);
      } else if (visible.current && scrollTop < 2000) {
        visible.current = false;
        setRendered(null);
      }
    });

    return () => rmOnScroll(SCROLLERS);
  }, []);

  return rendered;
}
