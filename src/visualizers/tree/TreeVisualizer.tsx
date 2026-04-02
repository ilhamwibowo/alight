import { useState, useRef, useCallback } from 'react';
import {
  type BSTNode, type TreeStep,
  insertBST, searchBST, deleteBST,
  inorderTraversal, preorderTraversal, postorderTraversal,
  TREE_CODE,
} from './algorithms';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import DebugPanel from '../../components/DebugPanel';
import AlgoInfo, { ALGO_INFO } from '../../components/AlgoInfo';
import StepScrubber from '../../components/StepScrubber';

type NodePos = { value: number; x: number; y: number; parentX?: number; parentY?: number };

function layoutTree(root: BSTNode | null): NodePos[] {
  const positions: NodePos[] = [];
  if (!root) return positions;
  const nodeCount = countNodes(root);
  const baseSpacing = Math.max(24, 200 / Math.max(1, Math.log2(nodeCount + 1)));
  function walk(node: BSTNode | null, x: number, y: number, spread: number, parentX?: number, parentY?: number) {
    if (!node) return;
    positions.push({ value: node.value, x, y, parentX, parentY });
    walk(node.left, x - spread, y + 60, spread * 0.52, x, y);
    walk(node.right, x + spread, y + 60, spread * 0.52, x, y);
  }
  walk(root, 350, 35, baseSpacing * 5);
  return positions;
}

function countNodes(node: BSTNode | null): number {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

const INITIAL_VALUES = [50, 30, 70, 20, 40, 60, 80];

function buildInitialTree(): BSTNode | null {
  let root: BSTNode | null = null;
  for (const v of INITIAL_VALUES) root = insertNode(root, v);
  return root;
}

function insertNode(root: BSTNode | null, value: number): BSTNode {
  if (!root) return { value, left: null, right: null };
  if (value < root.value) root.left = insertNode(root.left, value);
  else if (value > root.value) root.right = insertNode(root.right, value);
  return root;
}

export default function TreeVisualizer() {
  const [tree, setTree] = useState<BSTNode | null>(buildInitialTree);
  const [inputVal, setInputVal] = useState('');
  const [operation, setOperation] = useState<string>('Insert');
  const [activeCode, setActiveCode] = useState<string>('Insert');
  const [deleteStep, setDeleteStep] = useState<TreeStep | null>(null);

  const player = useAlgorithmPlayer<TreeStep>();
  const treeRef = useRef(tree);
  treeRef.current = tree;

  const handleAction = useCallback(() => {
    const val = parseInt(inputVal);
    if (isNaN(val)) return;
    player.reset();
    setDeleteStep(null);
    switch (operation) {
      case 'Insert':
        setActiveCode('Insert');
        player.load(insertBST(treeRef.current, val));
        player.play();
        break;
      case 'Search':
        setActiveCode('Search');
        player.load(searchBST(treeRef.current, val));
        player.play();
        break;
      case 'Delete': {
        setActiveCode('Delete');
        const newTree = deleteBST(treeRef.current, val);
        setTree(newTree);
        treeRef.current = newTree;
        setDeleteStep({ tree: newTree, highlighted: [], found: [], label: `Deleted ${val}`, explanation: `Removed ${val} from the BST. If the node had two children, it was replaced by its inorder successor.`, traversalOutput: [], activeLine: -1, variables: {}, comparisons: 0 });
        break;
      }
    }
    setInputVal('');
  }, [inputVal, operation, player.load, player.reset, player.play]);

  const handleTraversal = useCallback((type: 'Inorder' | 'Preorder' | 'Postorder') => {
    player.reset();
    setDeleteStep(null);
    setActiveCode(type);
    const generators = { Inorder: inorderTraversal, Preorder: preorderTraversal, Postorder: postorderTraversal };
    player.load(generators[type](treeRef.current));
    player.play();
  }, [player.load, player.reset, player.play]);

  const resetTree = useCallback(() => {
    player.reset();
    setDeleteStep(null);
    setTree(buildInitialTree());
    treeRef.current = buildInitialTree();
  }, [player.reset]);

  // Update the tree when the last step of an insert animation has a tree
  const playerStep = player.step;
  if (playerStep?.tree && player.isDone && treeRef.current !== playerStep.tree) {
    treeRef.current = playerStep.tree;
    setTimeout(() => setTree(playerStep.tree!), 0);
  }

  // Use delete step when there's no player step (delete is synchronous)
  const step = playerStep ?? deleteStep;
  const displayTree = step?.tree ?? tree;

  const positions = layoutTree(displayTree);
  const minX = positions.length > 0 ? Math.min(...positions.map((p) => p.x)) - 30 : 0;
  const maxX = positions.length > 0 ? Math.max(...positions.map((p) => p.x)) + 30 : 800;
  const maxY = positions.length > 0 ? Math.max(...positions.map((p) => p.y)) + 30 : 400;
  const svgWidth = maxX - minX + 40;
  const svgHeight = maxY + 40;

  const variables = step
    ? Object.entries(step.variables).map(([label, value]) => ({ label, value }))
    : [];
  const counters = step
    ? [{ label: 'Comparisons', value: step.comparisons }]
    : [];

  const codeKey = TREE_CODE[activeCode] ? activeCode : 'Insert';

  return (
    <div className="tree-viz">
      <AlgoInfo {...ALGO_INFO[activeCode]} />
      <div className="viz-split">
        <div className="viz-main">
          <div className="tree-canvas">
            <svg width={svgWidth} height={svgHeight} viewBox={`${minX - 20} 0 ${svgWidth} ${svgHeight}`}>
              {positions.map((pos) =>
                pos.parentX != null && (
                  <line key={`e-${pos.value}-${pos.parentX}`}
                    className={`tree-edge ${step?.highlighted.includes(pos.value) ? 'highlighted' : ''}`}
                    x1={pos.parentX} y1={pos.parentY} x2={pos.x} y2={pos.y} />
                )
              )}
              {positions.map((pos) => {
                let cls = 'tree-node';
                if (step?.highlighted.includes(pos.value)) cls += ' highlighted';
                if (step?.found.includes(pos.value)) cls += ' found';
                return (
                  <g key={`n-${pos.value}`} className={cls} transform={`translate(${pos.x},${pos.y})`}>
                    <circle r={20} />
                    <text>{pos.value}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          {step?.traversalOutput && step.traversalOutput.length > 0 && (
            <div className="traversal-result">
              Output: <span>[{step.traversalOutput.join(', ')}]</span>
            </div>
          )}
        </div>
        <div className="viz-debug">
          <DebugPanel
            code={TREE_CODE[codeKey]}
            activeLines={step && step.activeLine >= 0 ? [step.activeLine] : []}
            variables={variables}
            counters={counters}
            variableLabels={['node.val', 'depth']}
            counterLabels={['Comparisons']}
            explanation={step?.explanation}
          />
        </div>
      </div>

      <div className="controls-bar">
        <select className="algo-select" value={operation} onChange={(e) => setOperation(e.target.value)}>
          <option>Insert</option>
          <option>Search</option>
          <option>Delete</option>
        </select>
        <div className="tree-input-row">
          <input className="tree-input" type="number" placeholder="Value" value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction()} />
          <button className="ctrl-btn primary" onClick={handleAction} disabled={player.isPlaying}>Go</button>
        </div>
        <button className="ctrl-btn" onClick={() => handleTraversal('Inorder')} disabled={player.isPlaying} style={{ padding: '0 10px' }}>Inorder</button>
        <button className="ctrl-btn" onClick={() => handleTraversal('Preorder')} disabled={player.isPlaying} style={{ padding: '0 10px' }}>Preorder</button>
        <button className="ctrl-btn" onClick={() => handleTraversal('Postorder')} disabled={player.isPlaying} style={{ padding: '0 10px' }}>Postorder</button>

        <button className="ctrl-btn" onClick={player.stepBack} disabled={player.isPlaying || player.index <= 0} title="Step back">
          {'\u23EE'}
        </button>

        <button className="ctrl-btn" onClick={player.stepForward} disabled={player.isPlaying || player.isDone} title="Step forward">
          {'\u23ED'}
        </button>

        <button className="ctrl-btn" onClick={resetTree} title="Reset tree">{'\u21BB'}</button>

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
