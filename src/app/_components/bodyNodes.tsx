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
  push: (node: ReactNode) => void;
  pop: () => void;
}>({
  setNodes() {},
  push() {},
  pop() {},
});

export function BodyNodeProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes] = useState<ReactNode[]>([]);

  return (
    <BodyNodeCx.Provider
      value={{
        setNodes,

        push(node) {
          setNodes((nodes) => nodes.concat(node));
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
