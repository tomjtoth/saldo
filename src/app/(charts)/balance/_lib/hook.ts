import { createContext, useContext, useState } from "react";
import { CategoricalChartFunc } from "recharts/types/chart/types";

import { TBalanceChartData, TUserChartData } from "@/app/_lib/db";

export const BalanceChartCx = createContext<{
  users: TUserChartData[];
  hook?: ReturnType<typeof useBalanceChartHook>;
}>({ users: [] });

export const useBalanceChartCx = () => useContext(BalanceChartCx);

export function useBalanceChartHook(data: TBalanceChartData["data"]) {
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

  const findMinMax = (opts?: { minDate: number; maxDate: number }) =>
    data.reduce(
      (prev, curr) => {
        if (!opts || (curr.date >= opts.minDate && curr.date <= opts.maxDate)) {
          if (curr.min < prev.min) prev.min = curr.min;
          if (curr.max > prev.max) prev.max = curr.max;
        }

        return prev;
      },
      { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }
    );

  const isZoomedIn = () =>
    Object.entries(initialState).some(
      ([side, value]) => value != state[side as keyof typeof initialState]
    );

  function zoomIn() {
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

    const { min, max } = findMinMax({
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
  }

  const zoomOut = () => setState(initialState);

  const startHighlight: CategoricalChartFunc = (e) =>
    setState({ ...state, refAreaLeft: e.activeLabel });

  const dragHighlight: CategoricalChartFunc = ({ activeLabel: lbl }) => {
    if (
      state.refAreaLeft !== undefined &&
      (state.refAreaRight === undefined || state.refAreaRight !== lbl)
    ) {
      setState({ ...state, refAreaRight: lbl });
    }
  };

  const cancelHighlight = () => {
    if (state.refAreaLeft !== undefined)
      setState((prev) => ({ ...prev, refAreaLeft: undefined }));
  };

  return {
    state,
    findMinMax,
    zoomIn,
    zoomOut,
    isZoomedIn,
    startHighlight,
    dragHighlight,
    cancelHighlight,
  };
}
