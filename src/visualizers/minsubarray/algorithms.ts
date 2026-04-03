export type MinSubarrayStep = {
  left: number;
  right: number;
  currentSum: number;
  target: number;
  minLength: number;
  bestLeft: number;
  bestRight: number;
  nums: number[];
  phase: 'expand' | 'shrink' | 'done';
  activeLine: number;
  label: string;
  explanation: string;
  variables: Record<string, string | number | boolean | null>;
};

export const MIN_SUBARRAY_CODE = [
  'def minSubArrayLen(target, nums):',
  '  left, right = 0, 0',
  '  min_len = inf',
  '  cur_sum = 0',
  '  while right < len(nums):',
  '    cur_sum += nums[right]',
  '    while cur_sum >= target:',
  '      min_len = min(',
  '        min_len, right-left+1)',
  '      cur_sum -= nums[left]',
  '      left += 1',
  '    right += 1',
  '  return min_len or 0',
];

export function* minSubarrayLen(target: number, nums: number[]): Generator<MinSubarrayStep> {
  let left = 0;
  let right = 0;
  let minLength = Infinity;
  let currentSum = 0;
  let bestLeft = -1;
  let bestRight = -1;

  const mk = (
    phase: MinSubarrayStep['phase'],
    activeLine: number,
    label: string,
    explanation: string,
  ): MinSubarrayStep => ({
    left, right, currentSum, target, minLength,
    bestLeft, bestRight, nums, phase, activeLine, label, explanation,
    variables: {
      left,
      right,
      cur_sum: currentSum,
      min_len: minLength === Infinity ? '\u221E' : minLength,
      target,
    },
  });

  // Initial state
  yield mk(
    'expand', 1,
    'Initialize sliding window',
    `We need to find the shortest subarray with sum \u2265 ${target}. Start with an empty window: left=0, right=0, cur_sum=0.`,
  );

  while (right < nums.length) {
    currentSum += nums[right];

    yield mk(
      'expand', 5,
      `Expand: add nums[${right}]=${nums[right]}`,
      `Add nums[${right}]=${nums[right]} to the window. cur_sum is now ${currentSum}.${currentSum >= target ? ` That\u2019s \u2265 ${target}, so we try shrinking from the left.` : ` Still < ${target}, so we keep expanding.`}`,
    );

    while (currentSum >= target) {
      const windowLen = right - left + 1;
      const prevMin = minLength;

      if (windowLen < minLength) {
        minLength = windowLen;
        bestLeft = left;
        bestRight = right;
      }

      yield mk(
        'shrink', 7,
        `Window [${left}..${right}] len=${windowLen}${windowLen < prevMin ? ' \u2190 new best!' : ''}`,
        windowLen < prevMin
          ? `Window [${left}..${right}] has length ${windowLen}, beating the previous best of ${prevMin === Infinity ? '\u221E' : prevMin}. New min_len=${minLength}.`
          : `Window [${left}..${right}] has length ${windowLen}, which doesn\u2019t beat min_len=${minLength}. No update.`,
      );

      currentSum -= nums[left];

      yield mk(
        'shrink', 9,
        `Shrink: remove nums[${left}]=${nums[left]}`,
        `Remove nums[${left}]=${nums[left]} from the left. cur_sum drops to ${currentSum}.${currentSum >= target ? ` Still \u2265 ${target}, so we keep shrinking.` : ` Now < ${target}, done shrinking.`}`,
      );

      left++;
    }

    right++;
  }

  const result = minLength === Infinity ? 0 : minLength;

  yield {
    left, right: nums.length - 1, currentSum, target, minLength,
    bestLeft, bestRight, nums, phase: 'done', activeLine: 12,
    label: result === 0 ? 'No valid subarray' : `Min length = ${result}`,
    explanation: result === 0
      ? `No subarray sums to \u2265 ${target}. Return 0.`
      : `The shortest subarray with sum \u2265 ${target} has length ${result}, at indices [${bestLeft}..${bestRight}].`,
    variables: {
      left,
      right: nums.length - 1,
      cur_sum: currentSum,
      min_len: result,
      target,
    },
  };
}

export const DEFAULT_TARGET = 7;
export const DEFAULT_ARRAY = [2, 3, 1, 2, 4, 3];

export const PRESETS: { label: string; target: number; nums: number[] }[] = [
  { label: 'Classic', target: 7, nums: [2, 3, 1, 2, 4, 3] },
  { label: 'Exact fit', target: 4, nums: [1, 4, 4] },
  { label: 'No solution', target: 100, nums: [1, 2, 3, 4, 5] },
  { label: 'Single element', target: 3, nums: [1, 1, 3, 2] },
  { label: 'All big', target: 5, nums: [5, 6, 7, 8, 9] },
  { label: 'Long window', target: 15, nums: [1, 2, 3, 4, 5, 6, 1, 1] },
];
