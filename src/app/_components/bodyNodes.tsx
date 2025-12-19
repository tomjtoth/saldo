"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
import { v4 as uuid } from "uuid";

type TBodyNodeCx = {
  length: number;
  set: Dispatch<SetStateAction<ReactNode[]>>;

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
  length: 0,
  set() {},
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
    get length() {
      return nodes.length;
    },

    set: setNodes,

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
      setNodes(nodes.slice(0, -1));
    },
  };

  return (
    <BodyNodeCx.Provider value={cx}>
      {nodes}
      {children}
    </BodyNodeCx.Provider>
  );
}
