import { useState, useCallback, useEffect } from 'react';
import {
  type CellType,
  type GridCell,
  type PathStep,
  type PathAlgorithmName,
  pathAlgorithms,
  PATH_CODE,
} from './algorithms';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import DebugPanel from '../../components/DebugPanel';
import AlgoInfo, { ALGO_INFO } from '../../components/AlgoInfo';
import StepScrubber from '../../components/StepScrubber';

const ROWS = 18;
const COLS = 28;
const DEFAULT_START: [number, number] = [9, 3];
const DEFAULT_END: [number, number] = [9, 24];

function createGrid(): GridCell[][] {
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      row: r, col: c,
      type: (r === DEFAULT_START[0] && c === DEFAULT_START[1]) ? 'start'
        : (r === DEFAULT_END[0] && c === DEFAULT_END[1]) ? 'end'
        : 'empty',
      weight: 1,
    } as GridCell))
  );
}

function generateMaze(grid: GridCell[][]): GridCell[][] {
  const newGrid: GridCell[][] = grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      type: cell.type === 'start' || cell.type === 'end' ? cell.type : 'empty' as CellType,
      weight: 1,
    }))
  );
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (newGrid[r][c].type === 'empty' && Math.random() < 0.3) {
        newGrid[r][c] = { ...newGrid[r][c], type: 'wall' };
      }
    }
  }
  return newGrid;
}

export default function PathfindingVisualizer() {
  const [grid, setGrid] = useState(createGrid);
  const [algo, setAlgo] = useState<PathAlgorithmName>('BFS');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'wall' | 'erase'>('wall');
  const [placingMode, setPlacingMode] = useState<'start' | 'end' | null>(null);

  const player = useAlgorithmPlayer<PathStep>();

  const findCell = useCallback(
    (type: 'start' | 'end'): [number, number] => {
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          if (grid[r][c].type === type) return [r, c];
      return type === 'start' ? DEFAULT_START : DEFAULT_END;
    }, [grid]
  );

  // Load steps when algo or grid changes
  useEffect(() => {
    player.load(pathAlgorithms[algo](grid, findCell('start'), findCell('end')));
  }, [algo, grid, findCell, player.load]);

  const clearBoard = useCallback(() => {
    setGrid(createGrid());
  }, []);

  const handleCellDown = (r: number, c: number) => {
    if (player.isPlaying) return;
    player.reset();
    if (placingMode) {
      setGrid((prev) => {
        const ng = prev.map((row) => row.map((cell) => ({
          ...cell,
          type: cell.type === placingMode ? 'empty' as CellType : cell.type,
        })));
        ng[r][c] = { ...ng[r][c], type: placingMode };
        return ng;
      });
      setPlacingMode(null);
      return;
    }
    const cell = grid[r][c];
    if (cell.type === 'start' || cell.type === 'end') return;
    const mode = cell.type === 'wall' ? 'erase' : 'wall';
    setDrawMode(mode);
    setIsDrawing(true);
    setGrid((prev) => {
      const ng = prev.map((row) => row.map((c) => ({ ...c })));
      ng[r][c].type = mode === 'wall' ? 'wall' : 'empty';
      return ng;
    });
  };

  const handleCellEnter = (r: number, c: number) => {
    if (!isDrawing || player.isPlaying) return;
    const cell = grid[r][c];
    if (cell.type === 'start' || cell.type === 'end') return;
    setGrid((prev) => {
      const ng = prev.map((row) => row.map((c) => ({ ...c })));
      ng[r][c].type = drawMode === 'wall' ? 'wall' : 'empty';
      return ng;
    });
  };

  useEffect(() => {
    const up = () => setIsDrawing(false);
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  const step = player.step;
  const isDone = step?.done;

  const k = (r: number, c: number) => `${r},${c}`;

  const variables = step
    ? Object.entries(step.variables).map(([label, value]) => ({ label, value }))
    : [];

  const counters = step
    ? [{ label: 'Nodes visited', value: step.nodesVisited }]
    : [];

  return (
    <div className="pathfinding-viz">
      <AlgoInfo {...ALGO_INFO[algo]} />
      <div className="viz-split">
        <div className="viz-main">
          <div className="path-legend">
            <div className="legend-item">
              <div className="legend-swatch" style={{ background: 'var(--green)' }} /> Start
            </div>
            <div className="legend-item">
              <div className="legend-swatch" style={{ background: 'var(--red)' }} /> End
            </div>
            <div className="legend-item">
              <div className="legend-swatch" style={{ background: '#78756e' }} /> Wall
            </div>
            <div className="legend-item">
              <div className="legend-swatch" style={{ background: '#ddd6fe' }} /> Visited
            </div>
            <div className="legend-item">
              <div className="legend-swatch" style={{ background: 'var(--amber-bright)' }} /> Path
            </div>
          </div>
          <div className="grid-container">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, 20px)` }}>
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  let className = 'cell';
                  const cellKey = k(r, c);
                  if (cell.type === 'wall') className += ' wall';
                  else if (cell.type === 'start') className += ' start';
                  else if (cell.type === 'end') className += ' end';
                  else if (step?.path.some(([pr, pc]) => pr === r && pc === c))
                    className += ' path';
                  const isVisited = step?.visited.has(cellKey);
                  if (isVisited && className === 'cell') className += ' visited';

                  // Distance gradient for visited cells
                  let gradientStyle: React.CSSProperties | undefined;
                  if (isVisited && !step?.path.some(([pr, pc]) => pr === r && pc === c)
                    && cell.type !== 'start' && cell.type !== 'end' && cell.type !== 'wall') {
                    const visitedArr = Array.from(step!.visited);
                    const idx = visitedArr.indexOf(cellKey);
                    const total = visitedArr.length;
                    const t = total > 1 ? idx / (total - 1) : 0;
                    // Light indigo (close) to deeper indigo (far)
                    const alpha = 0.08 + t * 0.3;
                    gradientStyle = { background: `rgba(67, 56, 202, ${alpha})` };
                  }

                  return (
                    <div
                      key={cellKey} className={className}
                      style={gradientStyle}
                      onMouseDown={() => handleCellDown(r, c)}
                      onMouseEnter={() => handleCellEnter(r, c)}
                    >
                      {cell.type === 'start' && 'A'}
                      {cell.type === 'end' && 'B'}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        <div className="viz-debug">
          <DebugPanel
            code={PATH_CODE[algo]}
            activeLines={step && step.activeLine >= 0 ? [step.activeLine] : []}
            variables={variables}
            counters={counters}
            variableLabels={['node', 'visited_count']}
            counterLabels={['Nodes visited']}
            dataStructure={step ? { label: step.frontierLabel, items: step.frontier } : undefined}
            dataStructureLabel={algo === 'DFS' ? 'Stack' : algo === 'Dijkstra' ? 'Priority Queue' : 'Queue'}
            explanation={player.step?.explanation}
          />
        </div>
      </div>

      <div className="controls-bar">
        <select
          className="algo-select" value={algo}
          onChange={(e) => { setAlgo(e.target.value as PathAlgorithmName); player.reset(); }}
        >
          {Object.keys(pathAlgorithms).map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

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

        <button className="ctrl-btn" onClick={player.reset} title="Reset">{'\u21BB'}</button>
        <button className="ctrl-btn" onClick={clearBoard} style={{ padding: '0 10px' }}>Clear</button>
        <button className="ctrl-btn" onClick={() => { player.reset(); setGrid((g) => generateMaze(g)); }} style={{ padding: '0 10px' }}>Maze</button>
        <button
          className={`ctrl-btn ${placingMode === 'start' ? 'primary' : ''}`}
          onClick={() => setPlacingMode(placingMode === 'start' ? null : 'start')}
          style={{ padding: '0 10px' }}
          title="Click grid to place start point"
        >{placingMode === 'start' ? 'Click grid...' : 'Move A'}</button>
        <button
          className={`ctrl-btn ${placingMode === 'end' ? 'primary' : ''}`}
          onClick={() => setPlacingMode(placingMode === 'end' ? null : 'end')}
          style={{ padding: '0 10px' }}
          title="Click grid to place end point"
        >{placingMode === 'end' ? 'Click grid...' : 'Move B'}</button>

        <StepScrubber index={player.index} total={player.total} onScrub={player.scrubTo} />

        <span className="step-label">{step?.label ?? 'Draw walls, then play'}</span>

        <div className="speed-control">
          <label>Speed</label>
          <input type="range" min={1} max={99} value={player.speed} onChange={(e) => player.setSpeed(Number(e.target.value))} />
        </div>
      </div>
    </div>
  );
}
