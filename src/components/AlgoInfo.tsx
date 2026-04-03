type Props = {
  name: string;
  time: string;
  space: string;
  description: string;
  hint?: string;
};

export default function AlgoInfo({ name, time, space, description, hint }: Props) {
  return (
    <div className="algo-info">
      <div className="algo-info-header">
        <span className="algo-info-name">{name}</span>
        <span className="algo-info-badge">T: {time}</span>
        <span className="algo-info-badge">S: {space}</span>
      </div>
      <div className="algo-info-desc">{description}</div>
      {hint && <div className="algo-info-hint">{hint}</div>}
    </div>
  );
}

export const ALGO_INFO: Record<string, Omit<Props, 'hint'>> = {
  'Bubble Sort': {
    name: 'Bubble Sort',
    time: 'O(n\u00B2)',
    space: 'O(1)',
    description: 'Repeatedly swaps adjacent elements if they\u2019re in the wrong order. Largest elements "bubble" to the end each pass.',
  },
  'Selection Sort': {
    name: 'Selection Sort',
    time: 'O(n\u00B2)',
    space: 'O(1)',
    description: 'Finds the minimum element in the unsorted portion and places it at the beginning. Simple but slow.',
  },
  'Insertion Sort': {
    name: 'Insertion Sort',
    time: 'O(n\u00B2)',
    space: 'O(1)',
    description: 'Builds the sorted array one element at a time by inserting each into its correct position. Fast on nearly-sorted data.',
  },
  'Merge Sort': {
    name: 'Merge Sort',
    time: 'O(n log n)',
    space: 'O(n)',
    description: 'Divides the array in half, recursively sorts each half, then merges them. Guaranteed O(n log n) but uses extra memory.',
  },
  'Quick Sort': {
    name: 'Quick Sort',
    time: 'O(n log n) avg',
    space: 'O(log n)',
    description: 'Picks a pivot, partitions around it so smaller elements go left, larger go right. Fast in practice, O(n\u00B2) worst case.',
  },
  BFS: {
    name: 'Breadth-First Search',
    time: 'O(V + E)',
    space: 'O(V)',
    description: 'Explores all neighbors at the current depth before moving deeper. Guarantees the shortest path in an unweighted graph.',
  },
  DFS: {
    name: 'Depth-First Search',
    time: 'O(V + E)',
    space: 'O(V)',
    description: 'Goes as deep as possible down one path before backtracking. Doesn\u2019t guarantee shortest path, but uses less memory than BFS.',
  },
  Dijkstra: {
    name: 'Dijkstra\u2019s Algorithm',
    time: 'O((V+E) log V)',
    space: 'O(V)',
    description: 'Greedy algorithm that always expands the closest unvisited node. Finds shortest path in weighted graphs with non-negative edges.',
  },
  Insert: {
    name: 'BST Insert',
    time: 'O(h)',
    space: 'O(h)',
    description: 'Walks left if value is smaller, right if larger, until finding an empty spot. h = tree height (log n if balanced).',
  },
  Search: {
    name: 'BST Search',
    time: 'O(h)',
    space: 'O(1)',
    description: 'Binary decision at each node — go left or right. Eliminates half the remaining tree each step.',
  },
  Inorder: {
    name: 'Inorder Traversal',
    time: 'O(n)',
    space: 'O(h)',
    description: 'Left \u2192 Root \u2192 Right. On a BST, this visits nodes in sorted order.',
  },
  Preorder: {
    name: 'Preorder Traversal',
    time: 'O(n)',
    space: 'O(h)',
    description: 'Root \u2192 Left \u2192 Right. Useful for copying trees or prefix expressions.',
  },
  Postorder: {
    name: 'Postorder Traversal',
    time: 'O(n)',
    space: 'O(h)',
    description: 'Left \u2192 Right \u2192 Root. Useful for deleting trees or postfix expressions.',
  },
  Kadane: {
    name: 'Kadane\u2019s Algorithm',
    time: 'O(n)',
    space: 'O(1)',
    description: 'At each element, decide: extend the current subarray or start fresh. Tracks the running max to find the maximum sum subarray.',
  },
  MinSubarray: {
    name: 'Min Size Subarray Sum (Sliding Window)',
    time: 'O(n)',
    space: 'O(1)',
    description: 'Expand the window right until the sum meets the target, then shrink from the left to find the shortest valid window.',
  },
  JumpGame: {
    name: 'Jump Game (Greedy)',
    time: 'O(n)',
    space: 'O(1)',
    description: 'Track the farthest reachable index. At each position, extend the reach by nums[i]. If you ever land beyond max_reach, you\'re stuck.',
  },
  Floyd: {
    name: 'Floyd\u2019s Tortoise & Hare',
    time: 'O(n)',
    space: 'O(1)',
    description: 'Slow pointer moves 1 step, fast pointer moves 2 steps. If there\u2019s a cycle, they\u2019ll meet. No extra memory needed.',
  },
};
