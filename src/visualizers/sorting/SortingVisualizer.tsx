import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { type SortStep, type SortAlgorithmName, sortingAlgorithms, SORT_CODE } from './algorithms';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import DebugPanel from '../../components/DebugPanel';
import AlgoInfo, { ALGO_INFO } from '../../components/AlgoInfo';
import StepScrubber from '../../components/StepScrubber';
import AccessHeatmap from '../../components/AccessHeatmap';

type BarItem = { id: number; value: number };

function generateBars(size: number): BarItem[] {
  return Array.from({ length: size }, (_, i) => ({
    id: i,
    value: Math.floor(Math.random() * 90) + 10,
  }));
}

export default function SortingVisualizer() {
  const [size, setSize] = useState(30);
  const [bars, setBars] = useState<BarItem[]>(() => generateBars(30));
  const [algo, setAlgo] = useState<SortAlgorithmName>('Bubble Sort');

  const player = useAlgorithmPlayer<SortStep>();
  const barIdsRef = useRef<number[]>(bars.map((b) => b.id));

  // Load steps when algo or bars change
  const loadAlgo = useCallback(() => {
    barIdsRef.current = bars.map((b) => b.id);
    player.load(sortingAlgorithms[algo](bars.map((b) => b.value)));
  }, [algo, bars, player.load]);

  // Auto-load on mount and when algo changes
  useEffect(() => { loadAlgo(); }, [algo]);

  const resetArray = useCallback(() => {
    const newBars = generateBars(size);
    setBars(newBars);
    barIdsRef.current = newBars.map((b) => b.id);
    // Will reload via effect when bars change
  }, [size]);

  // Reload when bars change
  useEffect(() => { loadAlgo(); }, [bars]);

  // Compute display bars from current step by tracking ID swaps
  const displayBars = useMemo(() => {
    if (!player.step) return bars;

    // Rebuild bar positions by replaying swaps up to current index
    const ids = bars.map((b) => b.id);
    for (let i = 0; i <= player.index && i < player.steps.length; i++) {
      const s = player.steps[i];
      if (s.swapping.length === 2) {
        const [a, b] = s.swapping;
        [ids[a], ids[b]] = [ids[b], ids[a]];
      }
    }

    return player.step.array.map((val, i) => ({
      id: ids[i] ?? i,
      value: val,
    }));
  }, [player.step, player.index, player.steps, bars]);

  const step = player.step;

  // All bars sorted when we're at the final step and all indices are in sorted set
  const allSorted = player.isDone && step != null && step.sorted.length === displayBars.length;

  const maxVal = Math.max(...displayBars.map((b) => b.value));
  const barWidth = 100 / displayBars.length;
  const variables = step
    ? Object.entries(step.variables).map(([label, value]) => ({
        label,
        value: value === null ? null : value,
      }))
    : [];

  const counters = step
    ? [
        { label: 'Comparisons', value: step.comparisons },
        { label: 'Swaps', value: step.swaps },
      ]
    : [];

  return (
    <div className="sorting-viz">
      <AlgoInfo {...ALGO_INFO[algo]} />
      <div className="viz-split">
        <div className="viz-main">
          <div className="bars-container" style={{ position: 'relative' }}>
            {displayBars.map((bar, i) => {
              let className = 'bar';
              if (step?.sorted.includes(i)) className += ' sorted';
              else if (step?.swapping.includes(i)) className += ' swapping';
              else if (step?.comparing.includes(i)) className += ' comparing';
              return (
                <motion.div
                  key={bar.id}
                  layout
                  transition={{ type: 'spring', stiffness: 400, damping: 32, mass: 0.8 }}
                  className="bar-slot"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: `${i * barWidth}%`,
                    width: `${barWidth}%`,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    padding: '0 0.5px',
                  }}
                >
                  <span className="bar-tooltip">{bar.value}</span>
                  <motion.div
                    className={className}
                    style={{
                      width: '100%',
                      height: `${(bar.value / maxVal) * 100}%`,
                      borderRadius: '2px 2px 0 0',
                    }}
                    {...(allSorted
                      ? {
                          animate: {
                            scaleY: [1, 1.08, 1],
                          },
                          transition: {
                            duration: 0.3,
                            delay: i * 0.02,
                            ease: 'easeOut',
                          },
                        }
                      : {})}
                  />
                </motion.div>
              );
            })}
          </div>
          <AccessHeatmap
            steps={player.steps}
            currentIndex={player.index}
            arraySize={size}
          />
        </div>
        <div className="viz-debug">
          <DebugPanel
            code={SORT_CODE[algo]}
            activeLines={step && step.activeLine >= 0 ? [step.activeLine] : []}
            variables={variables}
            counters={counters}
            variableLabels={['i', 'j']}
            counterLabels={['Comparisons', 'Swaps']}
            explanation={step?.explanation}
            isComplete={allSorted}
          />
        </div>
      </div>

      <div className="controls-bar">
        <select
          className="algo-select"
          value={algo}
          onChange={(e) => {
            setAlgo(e.target.value as SortAlgorithmName);
            resetArray();
          }}
        >
          {Object.keys(sortingAlgorithms).map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        {!player.isPlaying ? (
          <button className="ctrl-btn primary" onClick={player.play} disabled={player.isDone}>
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

        <button className="ctrl-btn" onClick={player.stepForward} disabled={player.isPlaying || player.isDone} title="Step forward">
          {'\u23ED'}
        </button>

        <button className="ctrl-btn" onClick={resetArray} title="New array">
          {'\u21BB'}
        </button>

        <StepScrubber index={player.index} total={player.total} onScrub={player.scrubTo} />

        <div className="size-control">
          <label>Size: {size}</label>
          <input
            type="range" min={10} max={80} value={size}
            onChange={(e) => {
              const n = Number(e.target.value);
              setSize(n);
              const newBars = generateBars(n);
              setBars(newBars);
            }}
          />
        </div>

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
