import { useRootDivCx } from "@/components/rootDiv/clientSide";
import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";

const SCROLLERS = `SCROLLERS-${uuid()}`;

export default function Scrollers() {
  const { rootDivRef, addOnScroll, rmOnScroll } = useRootDivCx();
  const rootDiv = rootDivRef?.current;

  const visible = useRef(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    addOnScroll(SCROLLERS, ({ currentTarget: { scrollTop } }) => {
      if (!visible.current && scrollTop > 2000) {
        visible.current = true;
        setRendered(true);
      } else if (visible.current && scrollTop < 2000) {
        visible.current = false;
        setRendered(false);
      }
    });

    return () => rmOnScroll(SCROLLERS);
  }, []);

  return rendered ? (
    <>
      <div className="min-h-20"></div>
      <div className="absolute bottom-10 right-10 bg-background flex gap-2">
        <button
          onClick={() => {
            const newTop = rootDiv!.scrollTop - 2000;
            rootDiv!.scroll(0, newTop < 0 ? 0 : newTop);
          }}
        >
          ⬆️
        </button>
        <button
          onClick={() => {
            const newTop = rootDiv!.scrollTop + 2000;
            const divH = rootDiv?.scrollHeight ?? window.innerHeight;
            rootDiv!.scroll(0, newTop > divH ? divH : newTop);
          }}
        >
          ⬇️
        </button>
      </div>
    </>
  ) : null;
}
