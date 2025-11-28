import { DependencyList, EffectCallback, useEffect } from "react";

export function useDebugger(
  fnOrMsg: EffectCallback | string,
  ...deps: DependencyList
) {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(
      typeof fnOrMsg === "function" ? fnOrMsg : () => console.debug(fnOrMsg),
      deps
    );
  }
}
