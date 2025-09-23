import { TParetoChartData } from "../pareto/chart";

import Entry from "./entry";

export default function ChartStyler(pp: { users: TParetoChartData["users"] }) {
  return (
    <div
      className={
        "absolute left-1/2 top-1/2 -translate-1/2 " +
        "border w-fit rounded p-2 flex flex-col gap-2 items-center justify-center"
      }
    >
      {pp.users.map((user) => (
        <Entry key={user.id} {...user} />
      ))}
    </div>
  );
}
