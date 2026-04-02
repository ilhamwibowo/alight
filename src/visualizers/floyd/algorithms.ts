export type FloydStep = {
  slow: number;
  fast: number;
  slowPath: number[];
  fastPath: number[];
  met: boolean;
  noCycle: boolean;
  activeLine: number;
  variables: Record<string, string | number | boolean | null>;
  label: string;
  explanation: string;
  iteration: number;
};

export const FLOYD_CODE = [
  'def hasCycle(head):',
  '  slow = head',
  '  fast = head',
  '  while fast and fast.next:',
  '    slow = slow.next',
  '    fast = fast.next.next',
  '    if slow == fast:',
  '      return True',
  '  return False',
];

export type LinkedListNode = {
  id: number;
  next: number | null; // index of next node, null = end
};

export function buildList(size: number, cycleAt: number | null): LinkedListNode[] {
  const nodes: LinkedListNode[] = [];
  for (let i = 0; i < size; i++) {
    nodes.push({ id: i, next: i + 1 < size ? i + 1 : null });
  }
  // Create cycle: last node points back to cycleAt
  if (cycleAt !== null && cycleAt >= 0 && cycleAt < size) {
    nodes[size - 1].next = cycleAt;
  }
  return nodes;
}

export function* floydCycleDetection(nodes: LinkedListNode[]): Generator<FloydStep> {
  if (nodes.length === 0) {
    yield {
      slow: -1, fast: -1, slowPath: [], fastPath: [],
      met: false, noCycle: true, activeLine: 8,
      variables: {}, label: 'Empty list',
      explanation: 'The list is empty, so there cannot be a cycle.',
      iteration: 0,
    };
    return;
  }

  let slow = 0;
  let fast = 0;
  const slowPath: number[] = [0];
  const fastPath: number[] = [0];
  let iteration = 0;

  yield {
    slow, fast, slowPath: [...slowPath], fastPath: [...fastPath],
    met: false, noCycle: false, activeLine: 1,
    variables: { slow: 0, fast: 0 },
    label: 'Initialize both pointers at head',
    explanation: 'Both the turtle (slow) and hare (fast) start at the head of the list. The turtle moves 1 step at a time, the hare moves 2.',
    iteration,
  };

  while (true) {
    iteration++;

    // Check: fast and fast.next exist?
    const fastNode = nodes[fast];
    if (fastNode.next === null) {
      yield {
        slow, fast, slowPath: [...slowPath], fastPath: [...fastPath],
        met: false, noCycle: true, activeLine: 8,
        variables: { slow, fast, iteration },
        label: `fast.next is null — no cycle`,
        explanation: `The hare reached the end of the list (fast.next is null). If there were a cycle, the list would never end. No cycle exists.`,
        iteration,
      };
      return;
    }
    const fastNext = nodes[fastNode.next];
    if (fastNext.next === null) {
      // fast can't move 2 steps
      fast = fastNode.next;
      fastPath.push(fast);
      yield {
        slow, fast, slowPath: [...slowPath], fastPath: [...fastPath],
        met: false, noCycle: true, activeLine: 8,
        variables: { slow, fast, iteration },
        label: `fast.next.next is null — no cycle`,
        explanation: `The hare can't take two steps — fast.next.next is null. The list has a definite end, proving no cycle exists.`,
        iteration,
      };
      return;
    }

    // Move slow one step
    slow = nodes[slow].next!;
    slowPath.push(slow);

    yield {
      slow, fast, slowPath: [...slowPath], fastPath: [...fastPath],
      met: false, noCycle: false, activeLine: 4,
      variables: { slow, fast, iteration },
      label: `Turtle moves to node ${slow}`,
      explanation: `Turtle moves one step to node ${slow}. The hare is at node ${fast}. ${slow === fast ? 'They are at the same node!' : 'They are at different nodes, so no cycle detected yet.'}`,
      iteration,
    };

    // Move fast two steps
    fast = nodes[fastNode.next].next!;
    fastPath.push(fastNode.next);
    fastPath.push(fast);

    yield {
      slow, fast, slowPath: [...slowPath], fastPath: [...fastPath],
      met: false, noCycle: false, activeLine: 5,
      variables: { slow, fast, iteration },
      label: `Hare jumps to node ${fast}`,
      explanation: `Hare jumps two steps to node ${fast}. Moving at double speed, the hare will eventually lap the turtle inside any cycle.`,
      iteration,
    };

    // Check if they met
    yield {
      slow, fast, slowPath: [...slowPath], fastPath: [...fastPath],
      met: slow === fast, noCycle: false, activeLine: 6,
      variables: { slow, fast, iteration, 'slow==fast': slow === fast },
      label: slow === fast
        ? `They meet at node ${slow}! Cycle detected`
        : `slow=${slow}, fast=${fast} — not equal, continue`,
      explanation: slow === fast
        ? `Both pointers are at node ${slow}! The fast pointer caught up to the slow one inside the cycle. This proves a cycle exists.`
        : `Turtle is at node ${slow}, hare is at node ${fast}. They haven't met yet, so we continue the loop.`,
      iteration,
    };

    if (slow === fast) {
      yield {
        slow, fast, slowPath: [...slowPath], fastPath: [...fastPath],
        met: true, noCycle: false, activeLine: 7,
        variables: { slow, fast, iteration },
        label: `Cycle detected at node ${slow} after ${iteration} iterations`,
        explanation: `Cycle confirmed at node ${slow} after ${iteration} iteration${iteration === 1 ? '' : 's'}. Floyd's algorithm detects cycles in O(n) time using only O(1) extra space — just two pointers.`,
        iteration,
      };
      return;
    }
  }
}

export const DEFAULT_LIST_SIZE = 10;
export const DEFAULT_CYCLE_AT = 4;
