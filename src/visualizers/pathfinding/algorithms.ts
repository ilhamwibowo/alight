export type CellType = 'empty' | 'wall' | 'start' | 'end' | 'weight';

export type GridCell = {
  row: number;
  col: number;
  type: CellType;
  weight: number;
};

export type PathStep = {
  visited: Set<string>;
  path: [number, number][];
  current: [number, number] | null;
  label: string;
  explanation: string;
  done: boolean;
  activeLine: number;
  variables: Record<string, string | number | null>;
  frontier: string[]; // queue/stack contents as readable strings
  frontierLabel: string;
  nodesVisited: number;
};

const key = (r: number, c: number) => `${r},${c}`;

const neighbors = (
  r: number, c: number, rows: number, cols: number
): [number, number][] => {
  const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  return dirs
    .map(([dr, dc]) => [r + dr, c + dc] as [number, number])
    .filter(([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols);
};

function reconstructPath(
  parent: Map<string, string>, end: [number, number]
): [number, number][] {
  const path: [number, number][] = [];
  let cur = key(end[0], end[1]);
  while (parent.has(cur)) {
    const [r, c] = cur.split(',').map(Number);
    path.unshift([r, c]);
    cur = parent.get(cur)!;
  }
  const [r, c] = cur.split(',').map(Number);
  path.unshift([r, c]);
  return path;
}

// ── BFS ──

export const BFS_CODE = [
  'def bfs(grid, start, end):',
  '  queue = [start]',
  '  visited = {start}',
  '  parent = {}',
  '  while queue:',
  '    node = queue.pop(0)',
  '    if node == end:',
  '      return path(parent, end)',
  '    for nb in neighbors(node):',
  '      if nb not in visited:',
  '        visited.add(nb)',
  '        parent[nb] = node',
  '        queue.append(nb)',
];

export function* bfs(
  grid: GridCell[][], start: [number, number], end: [number, number]
): Generator<PathStep> {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const queue: [number, number][] = [start];
  visited.add(key(start[0], start[1]));
  let nodesVisited = 0;

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    nodesVisited++;
    const mk = (al: number, lbl: string, expl: string, extra?: Record<string, string | number | null>): PathStep => ({
      visited: new Set(visited), path: [], current: [r, c],
      label: lbl, explanation: expl, done: false, activeLine: al,
      variables: { node: `(${r},${c})`, queue_size: queue.length, visited_count: nodesVisited, ...extra },
      frontier: queue.slice(0, 12).map(([r, c]) => `(${r},${c})`),
      frontierLabel: 'Queue', nodesVisited,
    });

    yield mk(5, `Dequeue (${r},${c})`,
      `BFS dequeues (${r},${c}) — the node that's been waiting longest. BFS explores in layers, guaranteeing the shortest unweighted path.`);

    yield mk(6, `Is (${r},${c}) the end?`,
      r === end[0] && c === end[1]
        ? `Yes! (${r},${c}) is the target. We found the shortest path.`
        : `Is (${r},${c}) the target (${end[0]},${end[1]})? No — continue exploring its neighbors.`);

    if (r === end[0] && c === end[1]) {
      const path = reconstructPath(parent, end);
      yield {
        visited: new Set(visited), path, current: null,
        label: `Path found! Length: ${path.length}, visited: ${nodesVisited}`,
        explanation: `Path found with length ${path.length} after visiting ${nodesVisited} nodes. BFS guarantees this is the shortest path in an unweighted grid.`,
        done: true, activeLine: 7,
        variables: { path_length: path.length, total_visited: nodesVisited },
        frontier: [], frontierLabel: 'Queue', nodesVisited,
      };
      return;
    }

    yield mk(8, `Checking neighbors of (${r},${c})`,
      `Explore all unvisited neighbors of (${r},${c}). Each valid neighbor gets added to the back of the queue.`);

    for (const [nr, nc] of neighbors(r, c, rows, cols)) {
      const nk = key(nr, nc);
      if (!visited.has(nk) && grid[nr][nc].type !== 'wall') {
        visited.add(nk);
        parent.set(nk, key(r, c));
        queue.push([nr, nc]);
        yield mk(11, `Added (${nr},${nc}) to queue`,
          `Neighbor (${nr},${nc}) hasn't been visited and isn't a wall. Add it to the back of the queue so it's explored after all nodes at the current depth.`,
          { neighbor: `(${nr},${nc})` });
      }
    }
  }

  yield {
    visited: new Set(visited), path: [], current: null,
    label: 'No path found!',
    explanation: `The queue is empty and the target was never reached. No path exists from start to end — every reachable node has been visited.`,
    done: true, activeLine: 4,
    variables: { total_visited: nodesVisited },
    frontier: [], frontierLabel: 'Queue', nodesVisited,
  };
}

// ── DFS ──

export const DFS_CODE = [
  'def dfs(grid, start, end):',
  '  stack = [start]',
  '  visited = set()',
  '  parent = {}',
  '  while stack:',
  '    node = stack.pop()',
  '    if node in visited: continue',
  '    visited.add(node)',
  '    if node == end:',
  '      return path(parent, end)',
  '    for nb in neighbors(node):',
  '      if nb not in visited:',
  '        parent[nb] = node',
  '        stack.append(nb)',
];

export function* dfs(
  grid: GridCell[][], start: [number, number], end: [number, number]
): Generator<PathStep> {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const stack: [number, number][] = [start];
  let nodesVisited = 0;

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    const k = key(r, c);

    if (visited.has(k)) continue;
    visited.add(k);
    nodesVisited++;
    const mk = (al: number, lbl: string, expl: string, extra?: Record<string, string | number | null>): PathStep => ({
      visited: new Set(visited), path: [], current: [r, c],
      label: lbl, explanation: expl, done: false, activeLine: al,
      variables: { node: `(${r},${c})`, stack_depth: stack.length, visited_count: nodesVisited, ...extra },
      frontier: stack.slice(-12).reverse().map(([r, c]) => `(${r},${c})`),
      frontierLabel: 'Stack', nodesVisited,
    });

    yield mk(5, `Pop (${r},${c})`,
      `DFS pops (${r},${c}) from the stack — always explores the most recently discovered path first, going as deep as possible before backtracking.`);
    yield mk(7, `Mark (${r},${c}) visited`,
      `Mark (${r},${c}) as visited so we don't process it again. DFS may push the same node multiple times before visiting it.`);
    yield mk(8, `Is (${r},${c}) the end?`,
      r === end[0] && c === end[1]
        ? `Yes! (${r},${c}) is the target. Path found.`
        : `Is (${r},${c}) the target (${end[0]},${end[1]})? No — continue exploring deeper.`);

    if (r === end[0] && c === end[1]) {
      const path = reconstructPath(parent, end);
      yield {
        visited: new Set(visited), path, current: null,
        label: `Path found! Length: ${path.length}, visited: ${nodesVisited}`,
        explanation: `Path found with length ${path.length} after visiting ${nodesVisited} nodes. Note: DFS does not guarantee the shortest path.`,
        done: true, activeLine: 9,
        variables: { path_length: path.length, total_visited: nodesVisited },
        frontier: [], frontierLabel: 'Stack', nodesVisited,
      };
      return;
    }

    yield mk(10, `Checking neighbors of (${r},${c})`,
      `Explore all unvisited neighbors of (${r},${c}). Each valid neighbor gets pushed onto the stack.`);

    for (const [nr, nc] of neighbors(r, c, rows, cols)) {
      const nk = key(nr, nc);
      if (!visited.has(nk) && grid[nr][nc].type !== 'wall') {
        parent.set(nk, k);
        stack.push([nr, nc]);
        yield mk(13, `Pushed (${nr},${nc}) to stack`,
          `Neighbor (${nr},${nc}) hasn't been visited and isn't a wall. Push it onto the stack so DFS explores it next (LIFO order).`,
          { neighbor: `(${nr},${nc})` });
      }
    }
  }

  yield {
    visited: new Set(visited), path: [], current: null,
    label: 'No path found!',
    explanation: `The stack is empty and the target was never reached. No path exists from start to end — every reachable node has been visited.`,
    done: true, activeLine: 4,
    variables: { total_visited: nodesVisited },
    frontier: [], frontierLabel: 'Stack', nodesVisited,
  };
}

// ── Dijkstra ──

export const DIJKSTRA_CODE = [
  'def dijkstra(grid, start, end):',
  '  dist = {start: 0}',
  '  pq = [(0, start)]',
  '  parent, visited = {}, set()',
  '  while pq:',
  '    d, node = heappop(pq)',
  '    if node in visited: continue',
  '    visited.add(node)',
  '    if node == end:',
  '      return path(parent, end)',
  '    for nb in neighbors(node):',
  '      nd = d + weight(nb)',
  '      if nd < dist.get(nb, inf):',
  '        dist[nb] = nd',
  '        parent[nb] = node',
  '        heappush(pq, (nd, nb))',
];

export function* dijkstra(
  grid: GridCell[][], start: [number, number], end: [number, number]
): Generator<PathStep> {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set<string>();
  const dist = new Map<string, number>();
  const parent = new Map<string, string>();
  let nodesVisited = 0;

  const pq: { r: number; c: number; d: number }[] = [];
  const startKey = key(start[0], start[1]);
  dist.set(startKey, 0);
  pq.push({ r: start[0], c: start[1], d: 0 });

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d);
    const { r, c, d } = pq.shift()!;
    const k = key(r, c);

    if (visited.has(k)) continue;
    visited.add(k);
    nodesVisited++;
    const mk = (al: number, lbl: string, expl: string, extra?: Record<string, string | number | null>): PathStep => ({
      visited: new Set(visited), path: [], current: [r, c],
      label: lbl, explanation: expl, done: false, activeLine: al,
      variables: { node: `(${r},${c})`, dist: d, pq_size: pq.length, visited_count: nodesVisited, ...extra },
      frontier: pq.slice(0, 8).map((e) => `(${e.r},${e.c}):${e.d}`),
      frontierLabel: 'Priority Queue', nodesVisited,
    });

    yield mk(4, `Pop (${r},${c}) with dist=${d}`,
      `Pop (${r},${c}) with distance ${d} — the closest unvisited node. Dijkstra always processes the cheapest path first, guaranteeing shortest paths.`);
    yield mk(7, `Mark (${r},${c}) visited`,
      `Mark (${r},${c}) as visited. Once a node is popped from the priority queue, its shortest distance is finalized.`);
    yield mk(8, `Is (${r},${c}) the end?`,
      r === end[0] && c === end[1]
        ? `Yes! (${r},${c}) is the target. The shortest weighted path has cost ${d}.`
        : `Is (${r},${c}) the target (${end[0]},${end[1]})? No — continue relaxing its neighbors.`);

    if (r === end[0] && c === end[1]) {
      const path = reconstructPath(parent, end);
      yield {
        visited: new Set(visited), path, current: null,
        label: `Path found! Cost: ${d}, visited: ${nodesVisited}`,
        explanation: `Shortest weighted path found with cost ${d} and length ${path.length} after visiting ${nodesVisited} nodes. Dijkstra guarantees optimality for non-negative weights.`,
        done: true, activeLine: 9,
        variables: { cost: d, path_length: path.length, total_visited: nodesVisited },
        frontier: [], frontierLabel: 'Priority Queue', nodesVisited,
      };
      return;
    }

    yield mk(10, `Checking neighbors of (${r},${c})`,
      `Check each neighbor of (${r},${c}). If we find a shorter path to a neighbor through this node, we update its distance (relaxation).`);

    for (const [nr, nc] of neighbors(r, c, rows, cols)) {
      const nk = key(nr, nc);
      if (visited.has(nk) || grid[nr][nc].type === 'wall') continue;

      const w = grid[nr][nc].weight;
      const newDist = d + w;
      if (!dist.has(nk) || newDist < dist.get(nk)!) {
        const isFirstPath = !dist.has(nk);
        const oldDist = dist.get(nk);
        dist.set(nk, newDist);
        parent.set(nk, k);
        pq.push({ r: nr, c: nc, d: newDist });
        yield mk(15, `Relaxed (${nr},${nc}) dist=${newDist}`,
          `Path through (${r},${c}) to (${nr},${nc}) costs ${d}+${w}=${newDist}, which is ${isFirstPath ? 'the first path found' : `cheaper than the previous ${oldDist}`}. Update its distance and add to the priority queue.`,
          { neighbor: `(${nr},${nc})`, new_dist: newDist });
      }
    }
  }

  yield {
    visited: new Set(visited), path: [], current: null,
    label: 'No path found!',
    explanation: `The priority queue is empty and the target was never reached. No path exists from start to end — every reachable node has been visited.`,
    done: true, activeLine: 5,
    variables: { total_visited: nodesVisited },
    frontier: [], frontierLabel: 'Priority Queue', nodesVisited,
  };
}

export const PATH_CODE: Record<string, string[]> = {
  BFS: BFS_CODE,
  DFS: DFS_CODE,
  Dijkstra: DIJKSTRA_CODE,
};

export const pathAlgorithms = {
  BFS: bfs,
  DFS: dfs,
  Dijkstra: dijkstra,
} as const;

export type PathAlgorithmName = keyof typeof pathAlgorithms;
