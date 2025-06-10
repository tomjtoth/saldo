export default function Canceler({
  onClick: callback,
  zIndex,
}: {
  onClick: () => void;
  zIndex?: number;
}) {
  return (
    <div
      className={`${
        zIndex !== 1 ? `z-${zIndex} ` : ""
      }absolute top-0 left-0 h-full w-full bg-background/50 backdrop-blur-xs`}
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) callback();
      }}
    />
  );
}
