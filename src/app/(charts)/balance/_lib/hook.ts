import { createContext, useContext, useState } from "react";
import { MouseHandlerDataParam } from "recharts";

import { useAppSelector } from "@/app/_lib/hooks";
import { BalanceData } from "@/app/_lib/db";

export const BalanceChartCx = createContext<ReturnType<
  typeof useBalanceChartHook
> | null>(null);

export const useBalanceChartCx = () => useContext(BalanceChartCx);

export function findMinMax(
  { data, minMaxes }: Pick<BalanceData, "data" | "minMaxes">,
  opts?: { minDate: number; maxDate: number }
) {
  return data.reduce(
    (prev, curr) => {
      if (!opts || (curr.date >= opts.minDate && curr.date <= opts.maxDate)) {
        const currMinMax = minMaxes[curr.date];

        if (currMinMax.min < prev.min) prev.min = currMinMax.min;
        if (currMinMax.max > prev.max) prev.max = currMinMax.max;
      }

      return prev;
    },
    { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }
  );
}

export function useBalanceChartHook() {
  const initialState: {
    refAreaLeft?: string | number;
    refAreaRight?: string | number;
    left: string | number;
    right: string | number;
    bottom: string | number;
    top: string | number;
  } = {
    left: "dataMin",
    right: "dataMax",
    top: "dataMax",
    bottom: "dataMin",
  };

  const [state, setState] = useState(initialState);

  const balance = useAppSelector((s) => s.combined.group?.balance);

  return !balance
    ? null
    : {
        state,

        zoomIn() {
          let { refAreaLeft, refAreaRight } = state;

          if (refAreaLeft === refAreaRight || refAreaRight === undefined) {
            setState((prevState) => ({
              ...prevState,
              refAreaLeft: undefined,
              refAreaRight: undefined,
            }));
            return;
          }

          if (refAreaLeft! > refAreaRight)
            [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

          const { min, max } = findMinMax(balance, {
            minDate: refAreaLeft as number,
            maxDate: refAreaRight as number,
          });

          setState({
            bottom: min,
            top: max,
            left: refAreaLeft!,
            right: refAreaRight!,
            refAreaLeft: undefined,
            refAreaRight: undefined,
          });
        },

        zoomOut() {
          setState(initialState);
        },

        isZoomedIn() {
          return Object.entries(initialState).some(
            ([side, value]) => value != state[side as keyof typeof initialState]
          );
        },

        startHighlight(e: MouseHandlerDataParam) {
          setState({ ...state, refAreaLeft: e.activeLabel });
        },

        dragHighlight({ activeLabel: lbl }: MouseHandlerDataParam) {
          if (
            state.refAreaLeft !== undefined &&
            (state.refAreaRight === undefined || state.refAreaRight !== lbl)
          ) {
            setState({ ...state, refAreaRight: lbl });
          }
        },

        cancelHighlight() {
          if (state.refAreaLeft !== undefined)
            setState((prev) => ({ ...prev, refAreaLeft: undefined }));
        },
      };
}
