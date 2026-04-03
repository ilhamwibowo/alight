export type JumpGameStep = {
  index: number;
  maxReach: number;
  nums: number[];
  reachable: boolean[];  // which indices are reachable so far
  activeLine: number;
  label: string;
  explanation: string;
  result: 'pending' | 'true' | 'false';
  variables: Record<string, string | number | boolean | null>;
};

export const JUMP_CODE = [
  'def canJump(nums):',
  '  max_reach = 0',
  '  for i in range(len(nums)):',
  '    if i > max_reach:',
  '      return False',
  '    max_reach = max(',
  '      max_reach, i + nums[i])',
  '  return True',
];

export function* jumpGame(nums: number[]): Generator<JumpGameStep> {
  const reachable = nums.map(() => false);
  reachable[0] = true;

  // Initial state
  yield {
    index: -1,
    maxReach: 0,
    nums,
    reachable: [...reachable],
    activeLine: 1,
    label: 'Initialize max_reach = 0',
    explanation: `We start at index 0 with max_reach=0. At each position we can jump up to nums[i] steps forward. The goal is to reach the last index ${nums.length - 1}.`,
    result: 'pending',
    variables: { max_reach: 0, i: null },
  };

  let maxReach = 0;

  for (let i = 0; i < nums.length; i++) {
    // Check if i is reachable
    if (i > maxReach) {
      yield {
        index: i,
        maxReach,
        nums,
        reachable: [...reachable],
        activeLine: 3,
        label: `i=${i} > max_reach=${maxReach} — stuck!`,
        explanation: `Index ${i} is beyond our max_reach of ${maxReach}. We can't reach this position from any previous index, so we can never reach the end.`,
        result: 'false',
        variables: { max_reach: maxReach, i },
      };
      return;
    }

    reachable[i] = true;

    const prevReach = maxReach;
    const newReach = i + nums[i];

    // Show the max_reach update
    maxReach = Math.max(maxReach, newReach);

    // Mark newly reachable indices
    for (let j = prevReach + 1; j <= Math.min(maxReach, nums.length - 1); j++) {
      reachable[j] = true;
    }

    const extended = newReach > prevReach;

    yield {
      index: i,
      maxReach,
      nums,
      reachable: [...reachable],
      activeLine: 5,
      label: extended
        ? `i=${i}: max_reach ${prevReach} → ${maxReach}`
        : `i=${i}: max_reach stays ${maxReach}`,
      explanation: extended
        ? `At index ${i}, nums[${i}]=${nums[i]} lets us jump to ${i}+${nums[i]}=${newReach}. This extends max_reach from ${prevReach} to ${maxReach}.`
        : `At index ${i}, nums[${i}]=${nums[i]} lets us jump to ${i}+${nums[i]}=${newReach}, which doesn't beat our current max_reach of ${maxReach}. No update.`,
      result: 'pending',
      variables: { max_reach: maxReach, i, 'nums[i]': nums[i], 'i+nums[i]': newReach },
    };

    // Early exit if we can already reach the end
    if (maxReach >= nums.length - 1 && nums.length > 1) {
      yield {
        index: i,
        maxReach,
        nums,
        reachable: reachable.map(() => true),
        activeLine: 7,
        label: `Can reach the end!`,
        explanation: `max_reach=${maxReach} >= last index ${nums.length - 1}. We can definitely reach the end from here, so the answer is True.`,
        result: 'true',
        variables: { max_reach: maxReach, i },
      };
      return;
    }
  }

  yield {
    index: nums.length - 1,
    maxReach,
    nums,
    reachable: reachable.map(() => true),
    activeLine: 7,
    label: 'Reached the end — True',
    explanation: `We iterated through every index without getting stuck. max_reach=${maxReach} covers the last index, so we return True.`,
    result: 'true',
    variables: { max_reach: maxReach },
  };
}

export const DEFAULT_ARRAY = [2, 3, 1, 1, 4];

export const PRESETS: { label: string; nums: number[] }[] = [
  { label: 'Can jump', nums: [2, 3, 1, 1, 4] },
  { label: "Can't jump", nums: [3, 2, 1, 0, 4] },
  { label: 'Single element', nums: [0] },
  { label: 'All zeros', nums: [0, 0, 0, 0] },
  { label: 'Big jumps', nums: [5, 0, 0, 0, 0, 1] },
  { label: 'Tight path', nums: [1, 1, 1, 1, 1] },
];
