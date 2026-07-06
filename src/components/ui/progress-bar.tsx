type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-alt)]">
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,#1fa971_0%,#28c7b7_100%)]"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
