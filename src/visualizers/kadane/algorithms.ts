export type KadaneStep = {
  index: number;
  currentMax: number;
  globalMax: number;
  subarrayStart: number;
  subarrayEnd: number;
  bestStart: number;
  bestEnd: number;
  activeLine: number; // which line of code is executing
  label: string;
  explanation: string;
  done: boolean;
};

/**
 * Kadane's algorithm — Maximum Subarray (LeetCode 53)
 *
 * Yields a step for each meaningful state change so the UI can
 * highlight the current element, the running subarray, and the code line.
 */
export function* kadane(nums: number[]): Generator<KadaneStep> {
  if (nums.length === 0) {
    yield {
      index: -1,
      currentMax: 0,
      globalMax: 0,
      subarrayStart: 0,
      subarrayEnd: 0,
      bestStart: 0,
      bestEnd: 0,
      activeLine: 1,
      label: 'Empty array — return 0',
      explanation: 'The array is empty, so the maximum subarray sum is 0 by convention.',
      done: true,
    };
    return;
  }

  let res = nums[0];
  let currentMax = nums[0];
  let subStart = 0;
  let bestStart = 0;
  let bestEnd = 0;

  // Show initial state
  yield {
    index: 0,
    currentMax,
    globalMax: res,
    subarrayStart: 0,
    subarrayEnd: 0,
    bestStart: 0,
    bestEnd: 0,
    activeLine: 3,
    label: `Initialize: current_max = ${currentMax}, res = ${res}`,
    explanation: `Start with the first element ${nums[0]}. Both current_max and global best are ${nums[0]} — a single element is a valid subarray.`,
    done: false,
  };

  for (let i = 1; i < nums.length; i++) {
    const extendSum = currentMax + nums[i];
    const startFresh = nums[i];

    // Show the comparison
    yield {
      index: i,
      currentMax,
      globalMax: res,
      subarrayStart: subStart,
      subarrayEnd: i - 1,
      bestStart,
      bestEnd,
      activeLine: 5,
      label: `i=${i}: max(${extendSum}, ${startFresh})`,
      explanation: `At index ${i}, extending the subarray gives ${currentMax}+${nums[i] >= 0 ? '' : '('}${nums[i]}${nums[i] >= 0 ? '' : ')'}=${extendSum}, while starting fresh gives just ${startFresh}. ${startFresh > extendSum ? `Since ${startFresh} > ${extendSum}, we start a new subarray here.` : `Since ${extendSum} >= ${startFresh}, we extend the current subarray.`}`,
      done: false,
    };

    if (startFresh > extendSum) {
      currentMax = startFresh;
      subStart = i;
    } else {
      currentMax = extendSum;
    }

    // Show current_max update
    yield {
      index: i,
      currentMax,
      globalMax: res,
      subarrayStart: subStart,
      subarrayEnd: i,
      bestStart,
      bestEnd,
      activeLine: 5,
      label: `current_max = ${currentMax} (subarray [${subStart}..${i}])`,
      explanation: `The best subarray ending at index ${i} has sum ${currentMax}, spanning indices [${subStart}..${i}].`,
      done: false,
    };

    const prevRes = res;
    if (currentMax > res) {
      res = currentMax;
      bestStart = subStart;
      bestEnd = i;
    }

    // Show res update
    yield {
      index: i,
      currentMax,
      globalMax: res,
      subarrayStart: subStart,
      subarrayEnd: i,
      bestStart,
      bestEnd,
      activeLine: 7,
      label: res > prevRes
        ? `res updated: ${prevRes} -> ${res}`
        : `res unchanged: ${res}`,
      explanation: res > prevRes
        ? `current_max ${currentMax} beats the previous best ${prevRes}, so global best updates to ${res}. Best subarray is now [${bestStart}..${bestEnd}].`
        : `current_max ${currentMax} does not beat the global best ${res}, so no update. Best subarray remains [${bestStart}..${bestEnd}].`,
      done: false,
    };
  }

  yield {
    index: -1,
    currentMax,
    globalMax: res,
    subarrayStart: subStart,
    subarrayEnd: nums.length - 1,
    bestStart,
    bestEnd,
    activeLine: 9,
    label: `Maximum subarray sum = ${res}`,
    explanation: `Kadane's algorithm complete. The maximum subarray sum is ${res}, found at indices [${bestStart}..${bestEnd}]. The algorithm runs in O(n) time with a single pass.`,
    done: true,
  };
}

export const DEFAULT_ARRAY = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
