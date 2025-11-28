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
  push: {
    <T>(node: ReactNode | ((args: T) => ReactNode), args: T): void;
    (node: () => ReactNode): void;
    (node: ReactNode): void;
  };
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

        push<T extends object>(
          Node: ReactNode | ((args: T) => ReactNode),
          args?: T
        ) {
          setNodes((nodes) =>
            nodes.concat(
              typeof Node === "function" ? (
                <Node key={Node.name} {...(args ? args : ({} as T))} />
              ) : (
                Node
              )
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
