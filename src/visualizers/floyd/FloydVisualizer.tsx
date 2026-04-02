import { useState, useCallback, useEffect } from 'react';
import {
  type FloydStep,
  type LinkedListNode,
  floydCycleDetection,
  buildList,
  FLOYD_CODE,
  DEFAULT_LIST_SIZE,
  DEFAULT_CYCLE_AT,
} from './algorithms';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import DebugPanel from '../../components/DebugPanel';
import AlgoInfo, { ALGO_INFO } from '../../components/AlgoInfo';
import StepScrubber from '../../components/StepScrubber';

type NodePos = { id: number; x: number; y: number };

function layoutNodes(nodes: LinkedListNode[], cycleAt: number | null): NodePos[] {
  const positions: NodePos[] = [];
  const totalNodes = nodes.length;
  const nodeSpacing = 50;

  if (cycleAt === null) {
    // No cycle — straight line
    for (let i = 0; i < totalNodes; i++) {
      positions.push({ id: i, x: 40 + i * nodeSpacing, y: 140 });
    }
    return positions;
  }

  // Everything in a single row, then draw a curved return arrow
  // This avoids the ellipse layout entirely
  for (let i = 0; i < totalNodes; i++) {
    positions.push({ id: i, x: 40 + i * nodeSpacing, y: 140 });
  }

  return positions;
}

export default function FloydVisualizer() {
  const [listSize, setListSize] = useState(DEFAULT_LIST_SIZE);
  const [cycleAt, setCycleAt] = useState<number | null>(DEFAULT_CYCLE_AT);
  const [nodes, setNodes] = useState(() => buildList(DEFAULT_LIST_SIZE, DEFAULT_CYCLE_AT));

  const player = useAlgorithmPlayer<FloydStep>();

  // Load steps when nodes changes
  useEffect(() => {
    player.load(floydCycleDetection(nodes));
  }, [nodes, player.load]);

  const rebuildList = useCallback((size: number, cycle: number | null) => {
    setListSize(size);
    setCycleAt(cycle);
    setNodes(buildList(size, cycle));
  }, []);

  const step = player.step;
  const isDone = step?.met || step?.noCycle;

  const positions = layoutNodes(nodes, cycleAt);
  const minX = Math.min(...positions.map((p) => p.x)) - 40;
  const maxX = Math.max(...positions.map((p) => p.x)) + 40;
  const minY = Math.min(...positions.map((p) => p.y)) - 50;
  // Add space below for the cycle-back curve
  const cycleSpan = cycleAt !== null ? Math.abs(positions[positions.length - 1].x - positions[cycleAt].x) : 0;
  const curveRoom = cycleAt !== null ? 60 + cycleSpan * 0.15 : 0;
  const maxY = Math.max(...positions.map((p) => p.y)) + 30 + curveRoom;
  const svgW = maxX - minX;
  const svgH = maxY - minY;

  const variables = step
    ? Object.entries(step.variables).map(([label, value]) => ({ label, value }))
    : [];
  const counters = step
    ? [{ label: 'Iterations', value: step.iteration }]
    : [];

  return (
    <div className="floyd-viz">
      <AlgoInfo {...ALGO_INFO['Floyd']} />
      <div className="viz-split">
        <div className="viz-main floyd-main">
          <svg
            width="100%"
            height="100%"
            viewBox={`${minX - 20} ${minY - 20} ${svgW} ${svgH}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Edges */}
            {nodes.map((node) => {
              if (node.next === null) return null;
              const from = positions[node.id];
              const to = positions[node.next];
              if (!from || !to) return null;

              const isCycleBack = cycleAt !== null && node.id === nodes.length - 1 && node.next === cycleAt;

              if (isCycleBack) {
                // Curved arrow going below the row
                const dist = Math.abs(from.x - to.x);
                const curveY = from.y + 40 + dist * 0.15;
                const r = 18;
                const path = `M ${from.x} ${from.y + r} C ${from.x} ${curveY}, ${to.x} ${curveY}, ${to.x} ${to.y + r}`;

                // Arrowhead pointing up into the target node
                return (
                  <g key={`e-${node.id}`}>
                    <path d={path} fill="none" stroke="var(--accent-soft)" strokeWidth={1.5} strokeDasharray="4 3" />
                    <polygon
                      points={`${to.x},${to.y + r} ${to.x - 5},${to.y + r + 8} ${to.x + 5},${to.y + r + 8}`}
                      fill="var(--accent-soft)"
                    />
                  </g>
                );
              }

              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const r = 18;
              const fx = from.x + (dx / len) * r;
              const fy = from.y + (dy / len) * r;
              const tx = to.x - (dx / len) * r;
              const ty = to.y - (dy / len) * r;

              const angle = Math.atan2(dy, dx);
              const aw = 7;
              const ax1 = tx - aw * Math.cos(angle - 0.4);
              const ay1 = ty - aw * Math.sin(angle - 0.4);
              const ax2 = tx - aw * Math.cos(angle + 0.4);
              const ay2 = ty - aw * Math.sin(angle + 0.4);

              return (
                <g key={`e-${node.id}`}>
                  <line
                    x1={fx} y1={fy} x2={tx} y2={ty}
                    stroke="var(--border-hover)" strokeWidth={1.5}
                  />
                  <polygon
                    points={`${tx},${ty} ${ax1},${ay1} ${ax2},${ay2}`}
                    fill="var(--border-hover)"
                  />
                </g>
              );
            })}

            {/* Nodes */}
            {positions.map((pos) => {
              let fill = 'var(--bg-input)';
              let stroke = 'var(--border-hover)';
              let textFill = 'var(--ink)';
              let strokeWidth = 1.5;

              const isSlow = step && step.slow === pos.id;
              const isFast = step && step.fast === pos.id;
              const isMet = step?.met && isSlow && isFast;
              const isCycleStart = cycleAt === pos.id;

              if (isMet) {
                fill = 'var(--red-light)';
                stroke = 'var(--red)';
                strokeWidth = 3;
                textFill = 'var(--red)';
              } else if (isSlow && isFast) {
                fill = 'var(--accent-bg)';
                stroke = 'var(--accent)';
                strokeWidth = 2.5;
              } else if (isSlow) {
                fill = 'var(--green-light)';
                stroke = 'var(--green)';
                strokeWidth = 2.5;
                textFill = 'var(--green)';
              } else if (isFast) {
                fill = 'var(--amber-bg)';
                stroke = 'var(--amber)';
                strokeWidth = 2.5;
                textFill = 'var(--amber)';
              } else if (isCycleStart) {
                stroke = 'var(--accent-soft)';
                strokeWidth = 2;
              }

              return (
                <g key={`n-${pos.id}`} transform={`translate(${pos.x},${pos.y})`}>
                  <circle r={18} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                  <text
                    textAnchor="middle" dominantBaseline="central"
                    fontSize={11} fontWeight={600} fontFamily="inherit"
                    fill={textFill}
                  >
                    {pos.id}
                  </text>
                  {/* Pointer icons */}
                  {isSlow && !isFast && (
                    <text y={-28} textAnchor="middle" fontSize={18}>
                      {'\uD83D\uDC22'}
                    </text>
                  )}
                  {isFast && !isSlow && (
                    <text y={-28} textAnchor="middle" fontSize={18}>
                      {'\uD83D\uDC07'}
                    </text>
                  )}
                  {isSlow && isFast && (
                    <>
                      <text x={-10} y={-28} textAnchor="middle" fontSize={16}>
                        {'\uD83D\uDC22'}
                      </text>
                      <text x={10} y={-28} textAnchor="middle" fontSize={16}>
                        {'\uD83D\uDC07'}
                      </text>
                      {isMet && (
                        <text y={-44} textAnchor="middle" fontSize={14}>
                          {'\uD83D\uDCA5'}
                        </text>
                      )}
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          <div className="floyd-legend">
            <span className="floyd-legend-item">
              {'\uD83D\uDC22'} Tortoise (1 step)
            </span>
            <span className="floyd-legend-item">
              {'\uD83D\uDC07'} Hare (2 steps)
            </span>
            {cycleAt !== null && (
              <span className="floyd-legend-item">
                Cycle at node {cycleAt}
              </span>
            )}
          </div>
        </div>
        <div className="viz-debug">
          <DebugPanel
            code={FLOYD_CODE}
            activeLines={step && step.activeLine >= 0 ? [step.activeLine] : []}
            variables={variables}
            counters={counters}
            variableLabels={['slow', 'fast']}
            counterLabels={['Iterations']}
            explanation={player.step?.explanation}
          />
        </div>
      </div>

      <div className="controls-bar">
        <div className="size-control">
          <label>Nodes: {listSize}</label>
          <input
            type="range" min={5} max={15} value={listSize}
            onChange={(e) => rebuildList(Number(e.target.value), cycleAt !== null ? Math.min(cycleAt, Number(e.target.value) - 2) : null)}
          />
        </div>

        <div className="size-control">
          <label>Cycle at: {cycleAt ?? 'none'}</label>
          <input
            type="range" min={-1} max={listSize - 2} value={cycleAt ?? -1}
            onChange={(e) => {
              const v = Number(e.target.value);
              rebuildList(listSize, v < 0 ? null : v);
            }}
          />
        </div>

        {!player.isPlaying ? (
          <button className="ctrl-btn primary" onClick={player.play} disabled={!!isDone}>
            {'\u25B6'} Play
          </button>
        ) : (
          <button className="ctrl-btn primary" onClick={player.pause}>
            {'\u23F8'} Pause
          </button>
        )}

        <button className="ctrl-btn" onClick={player.stepBack} disabled={player.isPlaying || player.index <= 0} title="Step back">
          {'\u23EE'}
        </button>

        <button className="ctrl-btn" onClick={player.stepForward} disabled={player.isPlaying || !!isDone} title="Step">
          {'\u23ED'}
        </button>

        <button className="ctrl-btn" onClick={player.reset} title="Reset">
          {'\u21BB'}
        </button>

        <StepScrubber index={player.index} total={player.total} onScrub={player.scrubTo} />

        <span className="step-label">{step?.label ?? 'Ready'}</span>

        <div className="speed-control">
          <label>Speed</label>
          <input
            type="range" min={1} max={100} value={player.speed}
            onChange={(e) => player.setSpeed(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
