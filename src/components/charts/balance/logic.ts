import { useState } from "react";
import { CategoricalChartFunc } from "recharts/types/chart/types";

import { TBalanceChartData } from "@/lib/db";

export default function useLogic(data: TBalanceChartData["data"]) {
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

    let [bottom, top] = data.reduce(
      (prev, curr) => {
        if (
          curr.date >= (refAreaLeft as number)! &&
          curr.date <= (refAreaRight as number)!
        ) {
          if (curr.min < prev[0]) prev[0] = curr.min;
          if (curr.max > prev[1]) prev[1] = curr.max;
        }

        return prev;
      },
      [data[0].min, data[0].max]
    );

    setState({
      bottom,
      top,
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

  return {
    state,
    zoomIn,
    zoomOut,
    isZoomedIn,
    startHighlight,
    dragHighlight,
  };
}
