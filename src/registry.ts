export type VisualizerItem = {
  id: string;
  label: string;
  icon: string;
};

export type Category = {
  id: string;
  label: string;
  description: string;
  items: VisualizerItem[];
};

export const registry: Category[] = [
  {
    id: 'sorting',
    label: 'Sorting',
    description: 'Bubble, Selection, Insertion, Merge, Quick',
    items: [
      { id: 'sorting', label: 'Sorting Algorithms', icon: '\u2195' },
    ],
  },
  {
    id: 'pathfinding',
    label: 'Pathfinding',
    description: 'BFS, DFS, Dijkstra on a grid',
    items: [
      { id: 'pathfinding', label: 'Grid Pathfinding', icon: '\u2317' },
    ],
  },
  {
    id: 'trees',
    label: 'Trees',
    description: 'BST insert, search, traversals',
    items: [
      { id: 'tree', label: 'Binary Search Tree', icon: '\u2387' },
    ],
  },
  {
    id: 'dp',
    label: 'Dynamic Programming',
    description: 'Classic DP problems visualized',
    items: [
      { id: 'kadane', label: 'Max Subarray (LC 53)', icon: '\u03A3' },
      { id: 'jump-game', label: 'Jump Game (LC 55)', icon: '\u21E5' },
    ],
  },
  {
    id: 'sliding-window',
    label: 'Sliding Window',
    description: 'Two-pointer window techniques',
    items: [
      { id: 'min-subarray', label: 'Min Subarray Sum (LC 209)', icon: '\u21C6' },
    ],
  },
  {
    id: 'linked-list',
    label: 'Linked List',
    description: 'Cycle detection, pointer techniques',
    items: [
      { id: 'floyd', label: 'Tortoise & Hare (LC 141)', icon: '\u2942' },
    ],
  },
];
