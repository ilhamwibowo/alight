import { useState, useEffect } from 'react';
import { type KadaneStep, kadane, DEFAULT_ARRAY } from './algorithms';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import DebugPanel from '../../components/DebugPanel';
import AlgoInfo, { ALGO_INFO } from '../../components/AlgoInfo';
import StepScrubber from '../../components/StepScrubber';

const CODE_LINES = [
  'def maxSubArray(nums):',
  '  if not nums: return 0',
  '  res = nums[0]',
  '  cur = nums[0]',
  '  for i in range(1, len(nums)):',
  '    cur = max(cur + nums[i], nums[i])',
  '    res = max(res, cur)',
  '  return res',
];

const LINE_MAP: Record<number, number[]> = {
  1: [1],
  3: [2, 3],
  5: [4, 5],
  7: [6],
  9: [7],
};

export default function KadaneVisualizer() {
  const [nums, setNums] = useState<number[]>([...DEFAULT_ARRAY]);
  const [inputVal, setInputVal] = useState(DEFAULT_ARRAY.join(', '));

  const player = useAlgorithmPlayer<KadaneStep>();

  // Load steps when nums changes
  useEffect(() => {
    player.load(kadane([...nums]));
  }, [nums, player.load]);

  const applyInput = () => {
    const parsed = inputVal.split(/[,\s]+/).map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));
    if (parsed.length > 0) { setNums(parsed); }
  };

  const randomize = () => {
    const len = 10 + Math.floor(Math.random() * 8);
    const arr = Array.from({ length: len }, () => Math.floor(Math.random() * 21) - 10);
    setNums(arr); setInputVal(arr.join(', '));
  };

  const step = player.step;
  const activeLines = step ? (LINE_MAP[step.activeLine] ?? []) : [];

  const variables = step ? [
    { label: 'i', value: step.index >= 0 ? step.index : null },
    { label: 'current_max', value: step.currentMax, highlight: true },
    { label: 'res', value: step.globalMax, highlight: true },
    { label: 'subarray', value: step.index >= 0 ? `[${step.subarrayStart}..${step.subarrayEnd}]` : null },
    { label: 'best', value: `[${step.bestStart}..${step.bestEnd}]` },
  ] : [];

  return (
    <div className="kadane-viz">
      <AlgoInfo {...ALGO_INFO['Kadane']} />
      <div className="viz-split">
        <div className="viz-main">
          <div className="kadane-array">
            {nums.map((val, i) => {
              let cls = 'kadane-cell';
              if (step && !step.done) {
                if (i === step.index) cls += ' current';
                else if (i >= step.subarrayStart && i <= step.subarrayEnd) cls += ' in-subarray';
              }
              if (step?.done && i >= step.bestStart && i <= step.bestEnd) cls += ' best';
              return (
                <div key={i} className={cls}>
                  <span className="index">{i}</span>
                  <span className="value">{val}</span>
                </div>
              );
            })}
          </div>
          <div className="kadane-stats">
            <div className="kadane-stat">
              <div className="stat-label">current_max</div>
              <div className="stat-value current-max">{step ? step.currentMax : '\u2014'}</div>
            </div>
            <div className="kadane-stat">
              <div className="stat-label">result</div>
              <div className="stat-value global-max">{step ? step.globalMax : '\u2014'}</div>
            </div>
          </div>
        </div>
        <div className="viz-debug">
          <DebugPanel
            code={CODE_LINES}
            activeLines={activeLines}
            variables={variables}
            variableLabels={['i', 'cur', 'res', 'subarray', 'best']}
            explanation={player.step?.explanation}
          />
        </div>
      </div>

      <div className="controls-bar">
        <div className="kadane-input-row">
          <input className="kadane-array-input" value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyInput()}
            placeholder="-2, 1, -3, 4, ..." />
          <button className="ctrl-btn" onClick={applyInput} style={{ padding: '0 8px' }}>Set</button>
          <button className="ctrl-btn" onClick={randomize} style={{ padding: '0 8px' }}>Random</button>
        </div>
        {!player.isPlaying ? (
          <button className="ctrl-btn primary" onClick={player.play} disabled={player.isDone}>{'\u25B6'} Play</button>
        ) : (
          <button className="ctrl-btn primary" onClick={player.pause}>{'\u23F8'} Pause</button>
        )}

        <button className="ctrl-btn" onClick={player.stepBack} disabled={player.isPlaying || player.index <= 0} title="Step back">
          {'\u23EE'}
        </button>

        <button className="ctrl-btn" onClick={player.stepForward} disabled={player.isPlaying || player.isDone} title="Step">
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
