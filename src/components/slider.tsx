"use client";

export default function Slider({
  height = 24,
  margin = 4,
  checked,
  className: cn = "cursor-pointer",
  onClick: handler,
}: {
  height?: number;
  margin?: number;
  checked: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      style={{
        height,
        width: 2 * height,
      }}
      className={
        cn +
        " shrink-0 inline-block rounded-full border-1 duration-200 ease-in-out " +
        (checked ? "bg-green-500" : "bg-red-500")
      }
      onClick={handler}
    >
      <div
        className={
          "aspect-square rounded-full bg-background duration-200 ease-in-out " +
          "relative top-1/2 -translate-y-1/2"
        }
        style={{
          left: checked ? 2 * height - margin - (height - 2 * margin) : 4,
          height: height - 2 * margin,
        }}
      />
    </div>
  );
}
