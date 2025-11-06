"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

export const BodyNodeCx = createContext<{
  setNodes: Dispatch<SetStateAction<ReactNode[]>>;
  push: (node: ReactNode | (() => ReactNode)) => void;
  pop: () => void;
}>({
  setNodes() {},
  push() {},
  pop() {},
});

export default function BodyNodeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [nodes, setNodes] = useState<ReactNode[]>([]);

  return (
    <BodyNodeCx.Provider
      value={{
        setNodes,

        push(Node) {
          setNodes((nodes) =>
            nodes.concat(
              typeof Node === "function" ? <Node key={Node.name} /> : Node
            )
          );
        },

        pop() {
          setNodes((nodes) => {
            const len = nodes.length;
            return nodes.slice(0, len - 1);
          });
        },
      }}
    >
      {nodes}
      {children}
    </BodyNodeCx.Provider>
  );
}
