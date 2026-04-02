export type SortStep = {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  label: string;
  explanation: string;
  activeLine: number;
  variables: Record<string, string | number | boolean | null>;
  comparisons: number;
  swaps: number;
};

// ── Bubble Sort ──

export const BUBBLE_SORT_CODE = [
  'def bubble_sort(arr):',
  '  n = len(arr)',
  '  for i in range(n-1, 0, -1):',
  '    swapped = False',
  '    for j in range(i):',
  '      if arr[j] > arr[j+1]:',
  '        swap(arr[j], arr[j+1])',
  '        swapped = True',
  '    if not swapped:',
  '      break',
];

export function* bubbleSort(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const sorted: number[] = [];
  let comparisons = 0;
  let swaps = 0;

  for (let i = a.length - 1; i >= 0; i--) {
    let swapped = false;
    for (let j = 0; j < i; j++) {
      comparisons++;
      yield {
        array: [...a], comparing: [j, j + 1], swapping: [], sorted: [...sorted],
        label: `Comparing arr[${j}]=${a[j]} and arr[${j + 1}]=${a[j + 1]}`,
        explanation: a[j] > a[j + 1]
          ? `Comparing adjacent elements arr[${j}]=${a[j]} and arr[${j + 1}]=${a[j + 1]}. Since ${a[j]} > ${a[j + 1]}, we need to swap them.`
          : `Comparing adjacent elements arr[${j}]=${a[j]} and arr[${j + 1}]=${a[j + 1]}. Since ${a[j]} <= ${a[j + 1]}, they're already in order — no swap needed.`,
        activeLine: 5, variables: { i, j, swapped, 'arr[j]': a[j], 'arr[j+1]': a[j + 1] },
        comparisons, swaps,
      };

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
        swaps++;
        yield {
          array: [...a], comparing: [], swapping: [j, j + 1], sorted: [...sorted],
          label: `Swapped ${a[j + 1]} and ${a[j]}`,
          explanation: `arr[${j}]=${a[j]} was greater than arr[${j + 1}]=${a[j + 1]} before the swap, so we swapped them. This pushes the larger value one step closer to its final position at the end.`,
          activeLine: 6, variables: { i, j, swapped, 'arr[j]': a[j], 'arr[j+1]': a[j + 1] },
          comparisons, swaps,
        };
      }
    }
    sorted.push(i);
    if (!swapped) {
      for (let k = 0; k <= i; k++) sorted.push(k);
      yield {
        array: [...a], comparing: [], swapping: [], sorted: [...sorted],
        label: 'No swaps — array is sorted early',
        explanation: `No swaps occurred in this entire pass, which means every adjacent pair was already in order. The array is sorted — we can stop early.`,
        activeLine: 9, variables: { i, swapped },
        comparisons, swaps,
      };
      break;
    }
  }
  sorted.push(0);

  yield {
    array: [...a], comparing: [], swapping: [],
    sorted: Array.from({ length: a.length }, (_, i) => i),
    label: `Sorted! ${comparisons} comparisons, ${swaps} swaps`,
    explanation: `Bubble sort complete. Each pass bubbled the largest unsorted element to the end, taking ${comparisons} comparisons and ${swaps} swaps total.`,
    activeLine: -1, variables: {}, comparisons, swaps,
  };
}

// ── Selection Sort ──

export const SELECTION_SORT_CODE = [
  'def selection_sort(arr):',
  '  n = len(arr)',
  '  for i in range(n - 1):',
  '    min_idx = i',
  '    for j in range(i+1, n):',
  '      if arr[j] < arr[min_idx]:',
  '        min_idx = j',
  '    if min_idx != i:',
  '      swap(arr[i], arr[min_idx])',
];

export function* selectionSort(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const sorted: number[] = [];
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < a.length - 1; i++) {
    let minIdx = i;

    for (let j = i + 1; j < a.length; j++) {
      comparisons++;
      yield {
        array: [...a], comparing: [minIdx, j], swapping: [], sorted: [...sorted],
        label: `Finding min: comparing arr[${minIdx}]=${a[minIdx]} with arr[${j}]=${a[j]}`,
        explanation: a[j] < a[minIdx]
          ? `Scanning for the smallest element in the unsorted portion. arr[${j}]=${a[j]} is smaller than current min arr[${minIdx}]=${a[minIdx]}, so min_idx will update to ${j}.`
          : `Scanning for the smallest element in the unsorted portion. arr[${j}]=${a[j]} is not smaller than current min arr[${minIdx}]=${a[minIdx]}, so min_idx stays at ${minIdx}.`,
        activeLine: 5, variables: { i, j, min_idx: minIdx, 'arr[min]': a[minIdx], 'arr[j]': a[j] },
        comparisons, swaps,
      };

      if (a[j] < a[minIdx]) {
        minIdx = j;
        yield {
          array: [...a], comparing: [minIdx], swapping: [], sorted: [...sorted],
          label: `New minimum found at index ${minIdx}: ${a[minIdx]}`,
          explanation: `Found a new minimum value ${a[minIdx]} at index ${minIdx}. This is the smallest value seen so far in the unsorted portion starting at index ${i}.`,
          activeLine: 6, variables: { i, j, min_idx: minIdx, 'arr[min]': a[minIdx] },
          comparisons, swaps,
        };
      }
    }

    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      swaps++;
      yield {
        array: [...a], comparing: [], swapping: [i, minIdx], sorted: [...sorted],
        label: `Swapped arr[${i}] and arr[${minIdx}]`,
        explanation: `The smallest element in the unsorted portion was ${a[i]} at index ${minIdx}. Swap it into position ${i} so the sorted portion grows by one.`,
        activeLine: 8, variables: { i, min_idx: minIdx },
        comparisons, swaps,
      };
    }
    sorted.push(i);
  }
  sorted.push(a.length - 1);

  yield {
    array: [...a], comparing: [], swapping: [],
    sorted: Array.from({ length: a.length }, (_, i) => i),
    label: `Sorted! ${comparisons} comparisons, ${swaps} swaps`,
    explanation: `Selection sort complete. Each pass selected the minimum from the unsorted portion and placed it at the front, taking ${comparisons} comparisons and ${swaps} swaps total.`,
    activeLine: -1, variables: {}, comparisons, swaps,
  };
}

// ── Insertion Sort ──

export const INSERTION_SORT_CODE = [
  'def insertion_sort(arr):',
  '  for i in range(1, len(arr)):',
  '    key = arr[i]',
  '    j = i - 1',
  '    while j >= 0 and arr[j] > key:',
  '      arr[j+1] = arr[j]',
  '      j -= 1',
  '    arr[j+1] = key',
];

export function* insertionSort(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const sorted: number[] = [0];
  let comparisons = 0;
  let swaps = 0;

  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i;

    yield {
      array: [...a], comparing: [j], swapping: [], sorted: [...sorted],
      label: `Inserting key=${key} from index ${i}`,
      explanation: `Pick key=${key} from index ${i}. We'll slide it left into the already-sorted portion [0..${i - 1}] until we find its correct position.`,
      activeLine: 2, variables: { i, key, j: j - 1 },
      comparisons, swaps,
    };

    while (j > 0 && a[j - 1] > key) {
      comparisons++;
      yield {
        array: [...a], comparing: [j, j - 1], swapping: [], sorted: [...sorted],
        label: `arr[${j - 1}]=${a[j - 1]} > key=${key}, shifting right`,
        explanation: `arr[${j - 1}]=${a[j - 1]} is greater than key=${key}, so it needs to shift right to make room. The key hasn't found its spot yet.`,
        activeLine: 4, variables: { i, key, j: j - 1, 'arr[j]': a[j - 1] },
        comparisons, swaps,
      };

      a[j] = a[j - 1];
      swaps++;

      yield {
        array: [...a], comparing: [], swapping: [j, j - 1], sorted: [...sorted],
        label: `Shifted arr[${j - 1}] to index ${j}`,
        explanation: `Shifted ${a[j]} one position to the right (index ${j - 1} to ${j}), opening a gap for the key to slot into.`,
        activeLine: 5, variables: { i, key, j: j - 1 },
        comparisons, swaps,
      };

      j--;
    }

    if (j > 0) comparisons++; // the comparison that failed the while condition

    a[j] = key;
    yield {
      array: [...a], comparing: [], swapping: [], sorted: [...sorted],
      label: `Placed key=${key} at index ${j}`,
      explanation: j < i
        ? `Inserted key=${key} at index ${j}. Everything to its right in the sorted portion is larger, everything to its left is smaller or equal.`
        : `key=${key} is already in the correct position at index ${j} — no shifting was needed.`,
      activeLine: 7, variables: { i, key, j },
      comparisons, swaps,
    };

    sorted.push(i);
  }

  yield {
    array: [...a], comparing: [], swapping: [],
    sorted: Array.from({ length: a.length }, (_, i) => i),
    label: `Sorted! ${comparisons} comparisons, ${swaps} swaps`,
    explanation: `Insertion sort complete. Each element was inserted into its correct position within the sorted portion, taking ${comparisons} comparisons and ${swaps} shifts total.`,
    activeLine: -1, variables: {}, comparisons, swaps,
  };
}

// ── Merge Sort ──

export const MERGE_SORT_CODE = [
  'def merge_sort(arr, l, r):',
  '  if l >= r: return',
  '  mid = (l + r) // 2',
  '  merge_sort(arr, l, mid)',
  '  merge_sort(arr, mid+1, r)',
  '  # merge halves',
  '  temp, i, j = [], l, mid+1',
  '  while i <= mid and j <= r:',
  '    if arr[i] <= arr[j]:',
  '      temp += [arr[i]]; i += 1',
  '    else:',
  '      temp += [arr[j]]; j += 1',
  '  # copy back',
  '  arr[l:r+1] = temp + arr[i:mid+1] + arr[j:r+1]',
];

export function* mergeSort(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const sorted: Set<number> = new Set();
  let comparisons = 0;
  let swaps = 0;

  function* mergeSortHelper(left: number, right: number): Generator<SortStep> {
    if (left >= right) return;

    const mid = Math.floor((left + right) / 2);

    yield {
      array: [...a], comparing: [], swapping: [], sorted: [...sorted],
      label: `Splitting [${left}..${right}], mid=${mid}`,
      explanation: `Divide the subarray [${left}..${right}] at mid=${mid}. Merge sort recursively splits until each piece has one element, then merges them back in order.`,
      activeLine: 2, variables: { l: left, r: right, mid },
      comparisons, swaps,
    };

    yield* mergeSortHelper(left, mid);
    yield* mergeSortHelper(mid + 1, right);

    const temp: number[] = [];
    let i = left;
    let j = mid + 1;

    while (i <= mid && j <= right) {
      comparisons++;
      yield {
        array: [...a], comparing: [i, j], swapping: [], sorted: [...sorted],
        label: `Merging: arr[${i}]=${a[i]} vs arr[${j}]=${a[j]}`,
        explanation: a[i] <= a[j]
          ? `Comparing left half element arr[${i}]=${a[i]} with right half element arr[${j}]=${a[j]}. Since ${a[i]} <= ${a[j]}, take ${a[i]} from the left half first.`
          : `Comparing left half element arr[${i}]=${a[i]} with right half element arr[${j}]=${a[j]}. Since ${a[i]} > ${a[j]}, take ${a[j]} from the right half first.`,
        activeLine: 9, variables: { l: left, r: right, i, j, 'arr[i]': a[i], 'arr[j]': a[j] },
        comparisons, swaps,
      };

      if (a[i] <= a[j]) {
        temp.push(a[i++]);
      } else {
        temp.push(a[j++]);
      }
    }

    while (i <= mid) temp.push(a[i++]);
    while (j <= right) temp.push(a[j++]);

    const swapping: number[] = [];
    for (let k = 0; k < temp.length; k++) {
      a[left + k] = temp[k];
      swapping.push(left + k);
    }
    swaps += temp.length;

    yield {
      array: [...a], comparing: [], swapping, sorted: [...sorted],
      label: `Merged [${left}..${right}]`,
      explanation: `Both sorted halves have been merged into [${left}..${right}]. The merged result is now in sorted order within this range.`,
      activeLine: 14, variables: { l: left, r: right },
      comparisons, swaps,
    };

    if (left === 0 && right === arr.length - 1) {
      for (let k = left; k <= right; k++) sorted.add(k);
    }
  }

  yield* mergeSortHelper(0, a.length - 1);

  yield {
    array: [...a], comparing: [], swapping: [],
    sorted: Array.from({ length: a.length }, (_, i) => i),
    label: `Sorted! ${comparisons} comparisons, ${swaps} writes`,
    explanation: `Merge sort complete. The array was recursively split and merged back together in order, taking ${comparisons} comparisons and ${swaps} writes total.`,
    activeLine: -1, variables: {}, comparisons, swaps,
  };
}

// ── Quick Sort ──

export const QUICK_SORT_CODE = [
  'def quick_sort(arr, lo, hi):',
  '  if lo >= hi: return',
  '  pivot = arr[hi]',
  '  i = lo',
  '  for j in range(lo, hi):',
  '    if arr[j] < pivot:',
  '      swap(arr[i], arr[j])',
  '      i += 1',
  '  swap(arr[i], arr[hi])',
  '  quick_sort(arr, lo, i-1)',
  '  quick_sort(arr, i+1, hi)',
];

export function* quickSort(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const sorted: Set<number> = new Set();
  let comparisons = 0;
  let swaps = 0;

  function* quickSortHelper(low: number, high: number): Generator<SortStep> {
    if (low >= high) {
      if (low === high) sorted.add(low);
      return;
    }

    const pivot = a[high];
    let i = low;

    yield {
      array: [...a], comparing: [high], swapping: [], sorted: [...sorted],
      label: `Pivot = ${pivot} at index ${high}`,
      explanation: `Choose pivot=${pivot} (the last element). We'll partition so everything less than ${pivot} goes left and everything greater goes right.`,
      activeLine: 2, variables: { lo: low, hi: high, pivot, i },
      comparisons, swaps,
    };

    for (let j = low; j < high; j++) {
      comparisons++;
      yield {
        array: [...a], comparing: [j, high], swapping: [], sorted: [...sorted],
        label: `arr[${j}]=${a[j]} < pivot=${pivot}?`,
        explanation: a[j] < pivot
          ? `arr[${j}]=${a[j]} is less than pivot=${pivot}, so it belongs in the left partition. It will be swapped to position i=${i}.`
          : `arr[${j}]=${a[j]} is not less than pivot=${pivot}, so it stays in the right partition. No swap needed.`,
        activeLine: 5, variables: { lo: low, hi: high, pivot, i, j, 'arr[j]': a[j] },
        comparisons, swaps,
      };

      if (a[j] < pivot) {
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          swaps++;
          yield {
            array: [...a], comparing: [], swapping: [i, j], sorted: [...sorted],
            label: `Swapped arr[${i}] and arr[${j}]`,
            explanation: `Swapped ${a[i]} and ${a[j]} to move the smaller element into the left partition. The boundary i advances to ${i + 1}.`,
            activeLine: 6, variables: { lo: low, hi: high, pivot, i, j },
            comparisons, swaps,
          };
        }
        i++;
      }
    }

    if (i !== high) {
      [a[i], a[high]] = [a[high], a[i]];
      swaps++;
    }

    yield {
      array: [...a], comparing: [], swapping: [i, high], sorted: [...sorted],
      label: `Pivot placed at index ${i}`,
      explanation: `Pivot ${pivot} is placed at its final sorted position index ${i}. Everything left of it is smaller, everything right is larger.`,
      activeLine: 8, variables: { lo: low, hi: high, pivot, i },
      comparisons, swaps,
    };
    sorted.add(i);

    yield* quickSortHelper(low, i - 1);
    yield* quickSortHelper(i + 1, high);
  }

  yield* quickSortHelper(0, a.length - 1);

  yield {
    array: [...a], comparing: [], swapping: [],
    sorted: Array.from({ length: a.length }, (_, i) => i),
    label: `Sorted! ${comparisons} comparisons, ${swaps} swaps`,
    explanation: `Quick sort complete. Each pivot was placed in its final position, recursively partitioning the array, taking ${comparisons} comparisons and ${swaps} swaps total.`,
    activeLine: -1, variables: {}, comparisons, swaps,
  };
}

// ── Registry ──

export const SORT_CODE: Record<string, string[]> = {
  'Bubble Sort': BUBBLE_SORT_CODE,
  'Selection Sort': SELECTION_SORT_CODE,
  'Insertion Sort': INSERTION_SORT_CODE,
  'Merge Sort': MERGE_SORT_CODE,
  'Quick Sort': QUICK_SORT_CODE,
};

export const sortingAlgorithms = {
  'Bubble Sort': bubbleSort,
  'Selection Sort': selectionSort,
  'Insertion Sort': insertionSort,
  'Merge Sort': mergeSort,
  'Quick Sort': quickSort,
} as const;

export type SortAlgorithmName = keyof typeof sortingAlgorithms;
