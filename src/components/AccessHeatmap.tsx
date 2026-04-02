import { useMemo, useRef, useEffect } from 'react';

type StepAccess = {
  comparing: number[];
  swapping: number[];
  sorted: number[];
};

type Props = {
  steps: StepAccess[];
  currentIndex: number;
  arraySize: number;
};

export default function AccessHeatmap({ steps, currentIndex, arraySize }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sample steps to keep the heatmap manageable (max ~400 columns)
  const sampledSteps = useMemo(() => {
    if (steps.length <= 400) return steps;
    const ratio = steps.length / 400;
    return Array.from({ length: 400 }, (_, i) => steps[Math.floor(i * ratio)]);
  }, [steps]);

  const totalCols = sampledSteps.length;
  const totalRows = arraySize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || totalCols === 0 || totalRows === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayW = canvas.clientWidth;
    const displayH = canvas.clientHeight;
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    ctx.scale(dpr, dpr);

    const cellW = displayW / totalCols;
    const cellH = displayH / totalRows;

    // Clear
    ctx.clearRect(0, 0, displayW, displayH);

    // Current step marker (column in sampled space)
    const currentCol = steps.length <= 400
      ? currentIndex
      : Math.floor((currentIndex / steps.length) * 400);

    // Draw cells
    for (let col = 0; col < totalCols; col++) {
      if (col > currentCol) break; // Don't draw future steps

      const s = sampledSteps[col];
      for (let row = 0; row < totalRows; row++) {
        let color = '';
        if (s.swapping.includes(row)) {
          color = 'rgba(220, 38, 38, 0.7)'; // red
        } else if (s.comparing.includes(row)) {
          color = 'rgba(67, 56, 202, 0.5)'; // accent
        } else if (s.sorted.includes(row)) {
          color = 'rgba(29, 138, 71, 0.25)'; // green
        }

        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(col * cellW, row * cellH, cellW + 0.5, cellH + 0.5);
        }
      }
    }

    // Draw current step line
    if (currentCol >= 0 && currentCol < totalCols) {
      ctx.strokeStyle = 'var(--ink)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(currentCol * cellW, 0);
      ctx.lineTo(currentCol * cellW, displayH);
      ctx.stroke();
    }
  }, [sampledSteps, currentIndex, totalCols, totalRows, steps.length]);

  if (totalCols < 2) return null;

  return (
    <div className="access-heatmap">
      <div className="debug-section-title">Array Access Pattern</div>
      <div className="heatmap-wrap">
        <canvas ref={canvasRef} className="heatmap-canvas" />
        <div className="heatmap-labels">
          <span>index 0</span>
          <span>index {arraySize - 1}</span>
        </div>
      </div>
      <div className="heatmap-legend">
        <span className="heatmap-legend-item">
          <span className="heatmap-swatch" style={{ background: 'rgba(67, 56, 202, 0.5)' }} />
          compare
        </span>
        <span className="heatmap-legend-item">
          <span className="heatmap-swatch" style={{ background: 'rgba(220, 38, 38, 0.7)' }} />
          swap
        </span>
        <span className="heatmap-legend-item">
          <span className="heatmap-swatch" style={{ background: 'rgba(29, 138, 71, 0.25)' }} />
          sorted
        </span>
      </div>
    </div>
  );
}
