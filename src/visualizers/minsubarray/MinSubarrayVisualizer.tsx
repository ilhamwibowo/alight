import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  type MinSubarrayStep,
  minSubarrayLen,
  MIN_SUBARRAY_CODE,
  DEFAULT_ARRAY,
  DEFAULT_TARGET,
  PRESETS,
} from './algorithms';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import DebugPanel from '../../components/DebugPanel';
import AlgoInfo, { ALGO_INFO } from '../../components/AlgoInfo';
import StepScrubber from '../../components/StepScrubber';

const LINE_MAP: Record<number, number[]> = {
  1: [1, 2, 3],
  5: [4, 5],
  7: [6, 7, 8],
  9: [9, 10],
  12: [12],
};

export default function MinSubarrayVisualizer() {
  const [nums, setNums] = useState<number[]>([...DEFAULT_ARRAY]);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [inputVal, setInputVal] = useState(DEFAULT_ARRAY.join(', '));
  const [targetVal, setTargetVal] = useState(String(DEFAULT_TARGET));

  const player = useAlgorithmPlayer<MinSubarrayStep>();

  useEffect(() => {
    player.load(minSubarrayLen(target, [...nums]));
  }, [nums, target, player.load]);

  const applyInput = () => {
    const parsed = inputVal.split(/[,\s]+/).map((s) => parseInt(s.trim())).filter((n) => !isNaN(n) && n >= 0);
    const t = parseInt(targetVal);
    if (parsed.length > 0 && !isNaN(t) && t > 0) {
      setNums(parsed);
      setTarget(t);
    }
  };

  const randomize = () => {
    const len = 6 + Math.floor(Math.random() * 6);
    const arr = Array.from({ length: len }, () => 1 + Math.floor(Math.random() * 9));
    const t = Math.floor(arr.reduce((a, b) => a + b, 0) * (0.3 + Math.random() * 0.3));
    setNums(arr);
    setTarget(t);
    setInputVal(arr.join(', '));
    setTargetVal(String(t));
  };

  const step = player.step;
  const activeLines = step ? (LINE_MAP[step.activeLine] ?? []) : [];
  const isDone = step?.phase === 'done';

  const variables = step
    ? Object.entries(step.variables).map(([label, value]) => ({ label, value }))
    : [];

  return (
    <div className="minsub-viz">
      <AlgoInfo {...ALGO_INFO['MinSubarray']} />
      <div className="viz-split">
        <div className="viz-main">
          {/* Target indicator */}
          <div className="minsub-target-row">
            <span className="minsub-target-label">target</span>
            <span className="minsub-target-value">{target}</span>
          </div>

          {/* Array cells */}
          <div className="minsub-array">
            {nums.map((val, i) => {
              let cellState = '';
              if (step) {
                if (isDone && step.bestLeft >= 0 && i >= step.bestLeft && i <= step.bestRight) {
                  cellState = 'best';
                } else if (!isDone && i >= step.left && i <= step.right) {
                  cellState = step.phase === 'shrink' ? 'window-shrink' : 'window';
                }
              }

              return (
                <div key={i} className={`minsub-cell ${cellState}`}>
                  <span className="ms-index">{i}</span>
                  <motion.div
                    className="ms-value"
                    animate={{
                      scale: cellState === 'window-shrink' && i === step?.left ? 1.08 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    {val}
                  </motion.div>
                  {/* Pointer labels */}
                  <div className="ms-pointers">
                    {step && !isDone && i === step.left && <span className="ms-ptr left">L</span>}
                    {step && !isDone && i === step.right && <span className="ms-ptr right">R</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="minsub-stats">
            <div className="minsub-stat">
              <div className="stat-label">cur_sum</div>
              <div className={`stat-value ${step && step.currentSum >= target ? 'over' : ''}`}>
                {step ? step.currentSum : '\u2014'}
              </div>
            </div>
            <div className="minsub-stat">
              <div className="stat-label">min_len</div>
              <div className="stat-value best">
                {step ? (step.minLength === Infinity ? '\u221E' : step.minLength) : '\u2014'}
              </div>
            </div>
          </div>

          {/* Result badge */}
          {isDone && (
            <motion.div
              className={`minsub-result ${step.minLength === Infinity ? 'none' : 'found'}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {step.minLength === Infinity
                ? 'No valid subarray'
                : `Min length = ${step.minLength}`}
            </motion.div>
          )}
        </div>
        <div className="viz-debug">
          <DebugPanel
            code={MIN_SUBARRAY_CODE}
            activeLines={activeLines}
            variables={variables}
            variableLabels={['left', 'right', 'cur_sum', 'min_len', 'target']}
            explanation={step?.explanation}
            isComplete={isDone}
          />
        </div>
      </div>

      <div className="controls-bar">
        <div className="minsub-input-row">
          <select
            className="ms-preset-select"
            value=""
            onChange={(e) => {
              const preset = PRESETS.find((p) => p.label === e.target.value);
              if (preset) {
                setNums([...preset.nums]);
                setTarget(preset.target);
                setInputVal(preset.nums.join(', '));
                setTargetVal(String(preset.target));
              }
            }}
          >
            <option value="" disabled>Presets</option>
            {PRESETS.map((p) => (
              <option key={p.label} value={p.label}>{p.label}</option>
            ))}
          </select>
          <input
            className="ms-target-input"
            value={targetVal}
            onChange={(e) => setTargetVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyInput()}
            placeholder="target"
          />
          <input
            className="ms-array-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyInput()}
            placeholder="2, 3, 1, 2, 4, 3"
          />
          <button className="ctrl-btn" onClick={applyInput} style={{ padding: '0 8px' }}>Set</button>
          <button className="ctrl-btn" onClick={randomize} style={{ padding: '0 8px' }}>Random</button>
        </div>

        {!player.isPlaying ? (
          <button className="ctrl-btn primary" onClick={player.play} disabled={isDone}>{'\u25B6'} Play</button>
        ) : (
          <button className="ctrl-btn primary" onClick={player.pause}>{'\u23F8'} Pause</button>
        )}
        <button className="ctrl-btn" onClick={player.stepBack} disabled={player.isPlaying || player.index <= 0} title="Step back">
          {'\u23EE'}
        </button>
        <button className="ctrl-btn" onClick={player.stepForward} disabled={player.isPlaying || isDone} title="Step">
          {'\u23ED'}
        </button>
        <button className="ctrl-btn" onClick={player.reset} title="Reset">{'\u21BB'}</button>

        <StepScrubber index={player.index} total={player.total} onScrub={player.scrubTo} />

        <span className="step-label">{step?.label ?? 'Ready'}</span>
        <div className="speed-control">
          <label>Speed</label>
          <input type="range" min={1} max={100} value={player.speed} onChange={(e) => player.setSpeed(Number(e.target.value))} />
        </div>
      </div>
    </div>
  );
}
