# Alight

"See algorithms think." Interactive algorithm visualizer with step-through debugging, code highlighting, and explanations.

## Tech Stack
- React 19 + TypeScript + Vite
- framer-motion (animations)
- No other runtime deps. No router — state-based view switching.

## Project Structure

```
src/
  App.tsx              — Main app, sidebar, view switching
  registry.ts          — Algorithm registry (sidebar categories)
  index.css            — Theme variables
  App.css              — All component styles
  hooks/
    useAlgorithmPlayer.ts  — Shared playback hook (pre-computes steps, scrubbing)
  components/
    DebugPanel.tsx     — Code + variables + counters + explanation
    AlgoInfo.tsx       — Algorithm name, complexity, description (+ ALGO_INFO registry)
    StepScrubber.tsx   — Timeline scrubber
    AccessHeatmap.tsx  — Canvas heatmap for array access patterns
    AnimatedNumber.tsx — Smooth counter animation
    ComplexityChart.tsx — SVG line chart (available but not currently used)
  visualizers/
    <name>/
      algorithms.ts    — Step type + generator functions + code strings
      <Name>Visualizer.tsx — React component
```

## Adding a New Algorithm Visualizer

### 1. Create the algorithm file: `src/visualizers/<name>/algorithms.ts`

Define a step type with ALL of these fields:
```ts
export type MyStep = {
  // ... algorithm-specific state for rendering
  label: string;           // Short status text for controls bar
  explanation: string;     // 1-2 sentence plain-English explanation of WHY
  activeLine: number;      // Index into CODE array (-1 = none)
  variables: Record<string, string | number | boolean | null>;
  // ... any counters (comparisons, swaps, visits, iterations, etc.)
};
```

Define the code as a string array:
```ts
export const MY_CODE = [
  'def my_algo(input):',
  '  # keep lines short (<35 chars)',
  '  # use 2-space indent',
];
```

Write a generator function that yields steps:
```ts
export function* myAlgorithm(input: ...): Generator<MyStep> {
  // Every yield MUST include `explanation` with actual variable values.
  // The explanation teaches WHY, not just WHAT.
  // Bad:  "Comparing i and j"
  // Good: "arr[3]=17 > arr[4]=12, so we swap. This pushes the larger value toward the end."
  
  yield {
    ...state,
    label: `Comparing arr[${i}] and arr[${j}]`,
    explanation: `arr[${i}]=${a[i]} is greater than arr[${j}]=${a[j]}, so we swap them. ...`,
    activeLine: 3,
    variables: { i, j, ... },
  };
}
```

### 2. Create the visualizer component: `src/visualizers/<name>/<Name>Visualizer.tsx`

Follow this exact pattern:
```tsx
import { useState, useCallback, useEffect } from 'react';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import DebugPanel from '../../components/DebugPanel';
import AlgoInfo, { ALGO_INFO } from '../../components/AlgoInfo';
import StepScrubber from '../../components/StepScrubber';
import { type MyStep, myAlgorithm, MY_CODE } from './algorithms';

export default function MyVisualizer() {
  const [input, setInput] = useState(...);
  const player = useAlgorithmPlayer<MyStep>();

  // Load steps when input changes
  useEffect(() => {
    player.load(myAlgorithm(input));
  }, [input]);

  const step = player.step;
  const isDone = player.isDone; // or step?.done for algorithms with own done flag

  const variables = step
    ? Object.entries(step.variables).map(([label, value]) => ({ label, value }))
    : [];

  return (
    <div className="my-viz">
      <AlgoInfo {...ALGO_INFO['MyAlgo']} />
      <div className="viz-split">
        <div className="viz-main">
          {/* YOUR VISUALIZATION HERE */}
        </div>
        <div className="viz-debug">
          <DebugPanel
            code={MY_CODE}
            activeLines={step && step.activeLine >= 0 ? [step.activeLine] : []}
            variables={variables}
            counters={counters}
            variableLabels={['x', 'y']}       // Placeholders shown before playing
            counterLabels={['Operations']}     // Placeholders shown before playing
            explanation={step?.explanation}
            isComplete={isDone}
          />
        </div>
      </div>

      <div className="controls-bar">
        {/* Algorithm selector if multiple */}
        
        {!player.isPlaying ? (
          <button className="ctrl-btn primary" onClick={player.play} disabled={isDone}>Play</button>
        ) : (
          <button className="ctrl-btn primary" onClick={player.pause}>Pause</button>
        )}
        <button className="ctrl-btn" onClick={player.stepBack} disabled={player.isPlaying || player.index <= 0}>⏮</button>
        <button className="ctrl-btn" onClick={player.stepForward} disabled={player.isPlaying || isDone}>⏭</button>
        <button className="ctrl-btn" onClick={...reset logic}>↻</button>

        <StepScrubber index={player.index} total={player.total} onScrub={player.scrubTo} />

        <div className="speed-control">
          <label>Speed</label>
          <input type="range" min={1} max={100} value={player.speed}
            onChange={(e) => player.setSpeed(Number(e.target.value))} />
        </div>
      </div>
    </div>
  );
}
```

### 3. Register it

**`src/components/AlgoInfo.tsx`** — Add to `ALGO_INFO`:
```ts
MyAlgo: {
  name: 'My Algorithm',
  time: 'O(n)',
  space: 'O(1)',
  description: 'One sentence explaining the core idea.',
},
```

**`src/registry.ts`** — Add to an existing category or create a new one:
```ts
{
  id: 'category-id',
  label: 'Category',
  description: 'Short description',
  items: [
    { id: 'my-algo', label: 'My Algorithm (LC 123)', icon: '⌗' },
  ],
},
```

**`src/App.tsx`** — Import and map:
```tsx
import MyVisualizer from './visualizers/myalgo/MyVisualizer';

const visualizerComponents: Record<string, React.FC> = {
  ...existing,
  'my-algo': MyVisualizer,
};
```

### 4. Add CSS

Add styles to `src/App.css`. The new visualizer class needs to be added to the unified card selector:
```css
.sorting-viz,
.pathfinding-viz,
.tree-viz,
.kadane-viz,
.floyd-viz,
.my-viz {  /* ADD HERE */
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}
```

## Design Conventions

- **Color palette**: Warm linen light theme. See CSS variables in `index.css`.
- **Code lines**: Keep under ~35 characters. Use 2-space indent. Pseudocode, not real syntax.
- **Explanations**: Template strings using actual runtime values. Teach the WHY, not the WHAT. 1-2 sentences max.
- **Variable labels**: Use `variableLabels` prop on DebugPanel so the layout is stable before playing.
- **Debug panel**: Always on the right side (300px). Code + variables + counters + explanation.
- **Controls bar**: At the bottom of the card. Always include: play/pause, step back, step forward, reset, scrubber, speed.
- **No new npm deps** without discussion. Everything is built with React + framer-motion + CSS.

## Visual Quality Bar

The visualizations should be **stunning**, not just functional. Every new visualizer should:

- **Use framer-motion** for smooth transitions — elements should animate into position, not snap. See sorting bars for reference.
- **Color states meaningfully** — comparing, active, done, etc. should each have a distinct visual treatment using the palette from `index.css`.
- **Add data visualizations where they reveal insight** — e.g., the sorting heatmap shows access patterns, pathfinding uses distance gradients. Ask: "what would help someone *see* the algorithm's behavior that the basic animation doesn't show?"
- **Avoid flat/static layouts** — use subtle shadows, borders, and spacing to create depth. Everything sits in a unified card.
- **Hover states** — interactive elements should respond to hover (see bar tooltips in sorting).
- **Completion effects** — when an algorithm finishes, mark it visually (green border on explanation, cascading animation, etc.).

## Existing Visualizers (for reference)

| Algorithm | Category | File | Best reference for |
|-----------|----------|------|--------------------|
| Sorting (5 algos) | Sorting | `sorting/` | Bar visualization, framer-motion animation, heatmap |
| BFS/DFS/Dijkstra | Pathfinding | `pathfinding/` | Grid visualization, wall drawing, distance gradient |
| BST operations | Trees | `tree/` | SVG node/edge rendering, multiple operations |
| Kadane's (LC 53) | DP | `kadane/` | Array cell visualization, simple layout |
| Floyd's (LC 141) | Linked List | `floyd/` | Linked list SVG, emoji icons, cycle visualization |

When adding a new algorithm, pick the closest existing one as a starting template.
