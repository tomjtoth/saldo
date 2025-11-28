"use client";

import { createContext, ReactNode, useState } from "react";
import { v4 as uuid } from "uuid";

type TBodyNodeCx = {
  clear: () => void;

  push: {
    /**
     * Pass args separately instead of binding to the fn
     * `Component.bind(null, args)`
     * `<Component key={uuid()} {...args} />`
     */
    <T>(node: ReactNode | ((args: T) => ReactNode), args: T): void;
    /**
     * Pass the  fn and get a `<Component key={uuid()} />`
     */
    (node: () => ReactNode): void;
    /**
     * Pass the rendered node, make sure you define the key prop
     */
    (node: ReactNode): void;
  };

  pop: () => void;
};

export const BodyNodeCx = createContext<TBodyNodeCx>({
  clear() {},
  push() {},
  pop() {},
});

export default function BodyNodeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [nodes, setNodes] = useState<ReactNode[]>([]);

  const cx: TBodyNodeCx = {
    clear() {
      setNodes([]);
    },

    push<T extends object>(
      Node: ReactNode | ((args: T) => ReactNode),
      args?: T
    ) {
      setNodes((nodes) =>
        nodes.concat(
          typeof Node === "function" ? (
            <Node key={uuid()} {...(args ?? ({} as T))} />
          ) : (
            Node
          )
        )
      );
    },

    pop() {
      const len = nodes.length;
      setNodes(nodes.slice(0, len - 1));
    },
  };

  return (
    <BodyNodeCx.Provider value={cx}>
      {nodes}
      {children}
    </BodyNodeCx.Provider>
  );
}
