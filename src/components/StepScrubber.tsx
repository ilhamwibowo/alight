type Props = {
  index: number;
  total: number;
  onScrub: (index: number) => void;
};

export default function StepScrubber({ index, total, onScrub }: Props) {
  if (total === 0) return null;

  return (
    <div className="step-scrubber">
      <input
        type="range"
        min={0}
        max={total - 1}
        value={Math.max(0, index)}
        onChange={(e) => onScrub(Number(e.target.value))}
      />
      <span className="step-scrubber-label">
        {index < 0 ? 0 : index + 1} / {total}
      </span>
    </div>
  );
}
