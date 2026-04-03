import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { type JumpGameStep, jumpGame, JUMP_CODE, DEFAULT_ARRAY, PRESETS } from './algorithms';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import DebugPanel from '../../components/DebugPanel';
import AlgoInfo, { ALGO_INFO } from '../../components/AlgoInfo';
import StepScrubber from '../../components/StepScrubber';

const LINE_MAP: Record<number, number[]> = {
  1: [1],
  3: [2, 3, 4],
  5: [2, 5, 6],
  7: [7],
};

export default function JumpGameVisualizer() {
  const [nums, setNums] = useState<number[]>([...DEFAULT_ARRAY]);
  const [inputVal, setInputVal] = useState(DEFAULT_ARRAY.join(', '));

  const player = useAlgorithmPlayer<JumpGameStep>();

  useEffect(() => {
    player.load(jumpGame([...nums]));
  }, [nums, player.load]);

  const applyInput = () => {
    const parsed = inputVal.split(/[,\s]+/).map((s) => parseInt(s.trim())).filter((n) => !isNaN(n) && n >= 0);
    if (parsed.length > 0) { setNums(parsed); }
  };

  const randomize = () => {
    const len = 6 + Math.floor(Math.random() * 6);
    const arr = Array.from({ length: len }, () => Math.floor(Math.random() * 4));
    setNums(arr);
    setInputVal(arr.join(', '));
  };

  const step = player.step;
  const activeLines = step ? (LINE_MAP[step.activeLine] ?? []) : [];
  const isDone = step?.result === 'true' || step?.result === 'false';

  const variables = step ? Object.entries(step.variables).map(([label, value]) => ({ label, value })) : [];

  return (
    <div className="jumpgame-viz">
      <AlgoInfo {...ALGO_INFO['JumpGame']} />
      <div className="viz-split">
        <div className="viz-main">
          <div className="jumpgame-array">
            {nums.map((val, i) => {
              let cellState = '';
              if (step) {
                if (isDone && step.result === 'false' && i === step.index) {
                  cellState = 'stuck';
                } else if (isDone && step.result === 'true') {
                  cellState = 'done';
                } else if (i === step.index) {
                  cellState = 'current';
                } else if (step.reachable[i]) {
                  cellState = 'reachable';
                }
              }

              // Show the reach arc from current position
              const showArc = step && !isDone && i === step.index && val > 0;
              const arcWidth = val; // how many cells the arc spans

              return (
                <div key={i} className={`jumpgame-cell ${cellState}`}>
                  <span className="jg-index">{i}</span>
                  <motion.div
                    className="jg-value"
                    layout
                    animate={{
                      scale: cellState === 'current' ? 1.08 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    {val}
                  </motion.div>
                  {/* Reach indicator: shows how far you can jump from this cell */}
                  {showArc && (
                    <div
                      className="jg-reach-bar"
                      style={{ width: `${arcWidth * 56 + (arcWidth - 1) * 6}px` }}
                    />
                  )}
                  {step && step.maxReach === i && !isDone && (
                    <div className="jg-max-reach-marker" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Max reach stat + progress bar */}
          <div className="jumpgame-stats">
            <div className="jumpgame-stat">
              <div className="stat-label">max_reach</div>
              <div className="stat-value">{step?.maxReach ?? '\u2014'}</div>
            </div>
            <div className="jumpgame-stat">
              <div className="stat-label">target</div>
              <div className="stat-value target">{nums.length - 1}</div>
            </div>
          </div>
          <div className="jumpgame-reach-track">
            <div className="jg-track-bg" />
            <motion.div
              className="jg-track-fill"
              animate={{
                width: step
                  ? `${(Math.min(step.maxReach, nums.length - 1) / Math.max(nums.length - 1, 1)) * 100}%`
                  : '0%',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>

          {/* Result badge */}
          {isDone && (
            <motion.div
              className={`jumpgame-result ${step.result}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {step.result === 'true' ? 'Can Jump' : 'Cannot Jump'}
            </motion.div>
          )}
        </div>
        <div className="viz-debug">
          <DebugPanel
            code={JUMP_CODE}
            activeLines={activeLines}
            variables={variables}
            variableLabels={['max_reach', 'i', 'nums[i]', 'i+nums[i]']}
            explanation={step?.explanation}
            isComplete={isDone}
          />
        </div>
      </div>

      <div className="controls-bar">
        <div className="jumpgame-input-row">
          <select
            className="jg-preset-select"
            value=""
            onChange={(e) => {
              const preset = PRESETS.find((p) => p.label === e.target.value);
              if (preset) {
                setNums([...preset.nums]);
                setInputVal(preset.nums.join(', '));
              }
            }}
          >
            <option value="" disabled>Presets</option>
            {PRESETS.map((p) => (
              <option key={p.label} value={p.label}>{p.label}</option>
            ))}
          </select>
          <input
            className="jg-array-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyInput()}
            placeholder="2, 3, 1, 1, 4"
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
