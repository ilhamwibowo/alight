type DataPoint = { step: number; ops: number };

type Props = {
  /** Array of operation counts at each step */
  data: DataPoint[];
  /** Theoretical curves to overlay */
  theoreticals?: { label: string; fn: (n: number) => number; color: string }[];
  /** Total input size (for theoretical curve scaling) */
  inputSize: number;
  label?: string;
};

export default function ComplexityChart({
  data,
  theoreticals,
  inputSize: _inputSize,
  label = 'Operations',
}: Props) {
  void _inputSize; // used by callers for context
  if (data.length < 2) return null;

  const w = 500;
  const h = 80;
  const pad = { top: 8, right: 8, bottom: 20, left: 32 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const maxStep = data[data.length - 1].step;
  const maxOps = Math.max(...data.map((d) => d.ops), 1);

  // Scale theoretical curves to match
  const theoMax = theoreticals
    ? Math.max(...theoreticals.map((t) => t.fn(maxStep)))
    : 0;
  const yMax = Math.max(maxOps, theoMax) * 1.1;

  const sx = (v: number) => pad.left + (v / Math.max(maxStep, 1)) * innerW;
  const sy = (v: number) => pad.top + innerH - (v / yMax) * innerH;

  const actualPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${sx(d.step)} ${sy(d.ops)}`)
    .join(' ');

  return (
    <div className="complexity-chart">
      <div className="debug-section-title">{label}</div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((frac) => (
          <line
            key={frac}
            x1={pad.left} y1={sy(yMax * frac)}
            x2={w - pad.right} y2={sy(yMax * frac)}
            stroke="var(--border-subtle)" strokeWidth={0.5}
          />
        ))}

        {/* Theoretical curves */}
        {theoreticals?.map((t) => {
          const points = Array.from({ length: 50 }, (_, i) => {
            const step = (maxStep * (i + 1)) / 50;
            return { step, val: t.fn(step) };
          });
          const path = points
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.step)} ${sy(p.val)}`)
            .join(' ');
          return (
            <g key={t.label}>
              <path d={path} fill="none" stroke={t.color} strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
              <text
                x={sx(points[points.length - 1].step) - 2}
                y={sy(points[points.length - 1].val) - 4}
                fontSize={8} fill={t.color} textAnchor="end"
              >
                {t.label}
              </text>
            </g>
          );
        })}

        {/* Actual operations */}
        <path d={actualPath} fill="none" stroke="var(--accent)" strokeWidth={1.5} />

        {/* Current point */}
        {data.length > 0 && (
          <circle
            cx={sx(data[data.length - 1].step)}
            cy={sy(data[data.length - 1].ops)}
            r={3} fill="var(--accent)"
          />
        )}

        {/* Axes labels */}
        <text x={pad.left} y={h - 2} fontSize={8} fill="var(--text-muted)">0</text>
        <text x={w - pad.right} y={h - 2} fontSize={8} fill="var(--text-muted)" textAnchor="end">
          step {maxStep}
        </text>
        <text x={pad.left - 4} y={pad.top + 4} fontSize={8} fill="var(--text-muted)" textAnchor="end">
          {Math.round(yMax)}
        </text>
      </svg>
    </div>
  );
}

/** Helper: build data points from steps that have a counter field */
export function buildChartData<T>(
  steps: T[],
  currentIndex: number,
  getOps: (step: T) => number
): DataPoint[] {
  const data: DataPoint[] = [];
  const end = Math.min(currentIndex + 1, steps.length);
  for (let i = 0; i < end; i++) {
    data.push({ step: i, ops: getOps(steps[i]) });
  }
  return data;
}

/** Common theoretical complexity functions */
export const theoretical = {
  nSquared: (label = 'O(n\u00B2)') => ({
    label,
    fn: (n: number) => n * n * 0.01,
    color: 'var(--red)',
  }),
  nLogN: (label = 'O(n log n)') => ({
    label,
    fn: (n: number) => n * Math.log2(Math.max(n, 1)) * 0.1,
    color: 'var(--green)',
  }),
  linear: (label = 'O(n)') => ({
    label,
    fn: (n: number) => n,
    color: 'var(--green)',
  }),
};
