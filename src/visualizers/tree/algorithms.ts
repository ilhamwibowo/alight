export type BSTNode = {
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
};

export type TreeStep = {
  tree: BSTNode | null;
  highlighted: number[];
  found: number[];
  label: string;
  explanation: string;
  traversalOutput: number[];
  activeLine: number;
  variables: Record<string, string | number | null>;
  comparisons: number;
};

function cloneTree(node: BSTNode | null): BSTNode | null {
  if (!node) return null;
  return { value: node.value, left: cloneTree(node.left), right: cloneTree(node.right) };
}

// ── Insert ──

export const INSERT_CODE = [
  'def insert(root, val):',
  '    if root is None:',
  '        return Node(val)',
  '    if val < root.val:',
  '        root.left = insert(root.left, val)',
  '    elif val > root.val:',
  '        root.right = insert(root.right, val)',
  '    return root',
];

export function* insertBST(root: BSTNode | null, value: number): Generator<TreeStep> {
  let comparisons = 0;

  if (!root) {
    yield {
      tree: { value, left: null, right: null }, highlighted: [value], found: [],
      label: `Inserted ${value} as root`,
      explanation: `The tree is empty, so ${value} becomes the root node — the first element in the BST.`,
      traversalOutput: [],
      activeLine: 2, variables: { val: value }, comparisons,
    };
    return;
  }

  const newRoot = cloneTree(root)!;
  let current = newRoot;

  while (true) {
    comparisons++;
    yield {
      tree: cloneTree(newRoot), highlighted: [current.value], found: [],
      label: `Comparing ${value} with ${current.value}`,
      explanation: value < current.value
        ? `${value} < ${current.value}, so we go left. In a BST, all values less than the node go to the left subtree.`
        : value > current.value
          ? `${value} > ${current.value}, so we go right. In a BST, all values greater than the node go to the right subtree.`
          : `${value} equals ${current.value} — this value already exists in the BST.`,
      traversalOutput: [], activeLine: value < current.value ? 3 : 5,
      variables: { val: value, 'node.val': current.value, direction: value < current.value ? 'left' : 'right' },
      comparisons,
    };

    if (value < current.value) {
      if (!current.left) {
        current.left = { value, left: null, right: null };
        yield {
          tree: cloneTree(newRoot), highlighted: [], found: [value],
          label: `Inserted ${value} left of ${current.value}`,
          explanation: `Found an empty left child at node ${current.value}. Insert ${value} here because ${value} < ${current.value}.`,
          traversalOutput: [],
          activeLine: 4, variables: { val: value, parent: current.value }, comparisons,
        };
        return;
      }
      current = current.left;
    } else if (value > current.value) {
      if (!current.right) {
        current.right = { value, left: null, right: null };
        yield {
          tree: cloneTree(newRoot), highlighted: [], found: [value],
          label: `Inserted ${value} right of ${current.value}`,
          explanation: `Found an empty right child at node ${current.value}. Insert ${value} here because ${value} > ${current.value}.`,
          traversalOutput: [],
          activeLine: 6, variables: { val: value, parent: current.value }, comparisons,
        };
        return;
      }
      current = current.right;
    } else {
      yield {
        tree: cloneTree(newRoot), highlighted: [], found: [value],
        label: `${value} already exists`,
        explanation: `${value} is already in the BST. Duplicate values are not inserted to maintain the BST property.`,
        traversalOutput: [],
        activeLine: 7, variables: { val: value }, comparisons,
      };
      return;
    }
  }
}

// ── Search ──

export const SEARCH_CODE = [
  'def search(root, val):',
  '    if root is None:',
  '        return None',
  '    if val == root.val:',
  '        return root',
  '    if val < root.val:',
  '        return search(root.left, val)',
  '    else:',
  '        return search(root.right, val)',
];

export function* searchBST(root: BSTNode | null, value: number): Generator<TreeStep> {
  let current = root;
  let comparisons = 0;

  while (current) {
    comparisons++;
    yield {
      tree: cloneTree(root), highlighted: [current.value], found: [],
      label: `Checking ${current.value}`,
      explanation: value === current.value
        ? `Found it! ${value} equals the current node's value.`
        : value < current.value
          ? `Looking for ${value}. Current node is ${current.value}. Since ${value} < ${current.value}, the value must be in the left subtree.`
          : `Looking for ${value}. Current node is ${current.value}. Since ${value} > ${current.value}, the value must be in the right subtree.`,
      traversalOutput: [],
      activeLine: current.value === value ? 3 : value < current.value ? 5 : 7,
      variables: { val: value, 'node.val': current.value, depth: comparisons - 1 },
      comparisons,
    };

    if (value === current.value) {
      yield {
        tree: cloneTree(root), highlighted: [], found: [value],
        label: `Found ${value}! Depth: ${comparisons - 1}`,
        explanation: `Found ${value} at depth ${comparisons - 1} after ${comparisons} comparison${comparisons === 1 ? '' : 's'}. BST search is O(log n) on average because each comparison halves the search space.`,
        traversalOutput: [],
        activeLine: 4, variables: { val: value, depth: comparisons - 1 }, comparisons,
      };
      return;
    }
    current = value < current.value ? current.left : current.right;
  }

  yield {
    tree: cloneTree(root), highlighted: [], found: [],
    label: `${value} not found (${comparisons} comparisons)`,
    explanation: `Reached a null child after ${comparisons} comparison${comparisons === 1 ? '' : 's'}. ${value} is not in the BST — if it were, it would have been along this path.`,
    traversalOutput: [],
    activeLine: 2, variables: { val: value }, comparisons,
  };
}

// ── Traversals ──

export const INORDER_CODE = [
  'def inorder(node):',
  '    if node is None:',
  '        return',
  '    inorder(node.left)',
  '    visit(node.val)',
  '    inorder(node.right)',
];

export const PREORDER_CODE = [
  'def preorder(node):',
  '    if node is None:',
  '        return',
  '    visit(node.val)',
  '    preorder(node.left)',
  '    preorder(node.right)',
];

export const POSTORDER_CODE = [
  'def postorder(node):',
  '    if node is None:',
  '        return',
  '    postorder(node.left)',
  '    postorder(node.right)',
  '    visit(node.val)',
];

export function* inorderTraversal(root: BSTNode | null): Generator<TreeStep> {
  const output: number[] = [];
  const callStack: number[] = [];
  let comparisons = 0;

  function* traverse(node: BSTNode | null): Generator<TreeStep> {
    if (!node) return;
    callStack.push(node.value);

    yield* traverse(node.left);

    output.push(node.value);
    comparisons++;
    yield {
      tree: cloneTree(root), highlighted: [node.value], found: [],
      label: `Visit ${node.value}`,
      explanation: `Visit ${node.value} — in inorder traversal, we visit left subtree first, then the node, then right subtree. This produces values in sorted (ascending) order.`,
      traversalOutput: [...output],
      activeLine: 4, variables: { 'node.val': node.value, stack: callStack.join(' > ') },
      comparisons,
    };

    yield* traverse(node.right);
    callStack.pop();
  }

  yield* traverse(root);
  yield {
    tree: cloneTree(root), highlighted: [], found: [],
    label: `Inorder: [${output.join(', ')}]`,
    explanation: `Inorder traversal complete: [${output.join(', ')}]. Notice the values are in sorted order — this is a key property of inorder traversal on a BST.`,
    traversalOutput: [...output],
    activeLine: -1, variables: {}, comparisons,
  };
}

export function* preorderTraversal(root: BSTNode | null): Generator<TreeStep> {
  const output: number[] = [];
  const callStack: number[] = [];
  let comparisons = 0;

  function* traverse(node: BSTNode | null): Generator<TreeStep> {
    if (!node) return;
    callStack.push(node.value);

    output.push(node.value);
    comparisons++;
    yield {
      tree: cloneTree(root), highlighted: [node.value], found: [],
      label: `Visit ${node.value}`,
      explanation: `Visit ${node.value} — in preorder traversal, we visit the node first, then its left subtree, then right subtree. This captures the tree's structure (root before children).`,
      traversalOutput: [...output],
      activeLine: 3, variables: { 'node.val': node.value, stack: callStack.join(' > ') },
      comparisons,
    };

    yield* traverse(node.left);
    yield* traverse(node.right);
    callStack.pop();
  }

  yield* traverse(root);
  yield {
    tree: cloneTree(root), highlighted: [], found: [],
    label: `Preorder: [${output.join(', ')}]`,
    explanation: `Preorder traversal complete: [${output.join(', ')}]. The first element is always the root. Preorder is useful for copying or serializing a tree.`,
    traversalOutput: [...output],
    activeLine: -1, variables: {}, comparisons,
  };
}

export function* postorderTraversal(root: BSTNode | null): Generator<TreeStep> {
  const output: number[] = [];
  const callStack: number[] = [];
  let comparisons = 0;

  function* traverse(node: BSTNode | null): Generator<TreeStep> {
    if (!node) return;
    callStack.push(node.value);

    yield* traverse(node.left);
    yield* traverse(node.right);

    output.push(node.value);
    comparisons++;
    yield {
      tree: cloneTree(root), highlighted: [node.value], found: [],
      label: `Visit ${node.value}`,
      explanation: `Visit ${node.value} — in postorder traversal, we visit left subtree, then right subtree, then the node itself. Children are always processed before their parent.`,
      traversalOutput: [...output],
      activeLine: 5, variables: { 'node.val': node.value, stack: callStack.join(' > ') },
      comparisons,
    };

    callStack.pop();
  }

  yield* traverse(root);
  yield {
    tree: cloneTree(root), highlighted: [], found: [],
    label: `Postorder: [${output.join(', ')}]`,
    explanation: `Postorder traversal complete: [${output.join(', ')}]. The last element is always the root. Postorder is useful for deleting a tree (children before parent).`,
    traversalOutput: [...output],
    activeLine: -1, variables: {}, comparisons,
  };
}

export function deleteBST(root: BSTNode | null, value: number): BSTNode | null {
  if (!root) return null;
  const newRoot = cloneTree(root);
  function deleteNode(node: BSTNode | null, val: number): BSTNode | null {
    if (!node) return null;
    if (val < node.value) { node.left = deleteNode(node.left, val); }
    else if (val > node.value) { node.right = deleteNode(node.right, val); }
    else {
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      let successor = node.right;
      while (successor.left) successor = successor.left;
      node.value = successor.value;
      node.right = deleteNode(node.right, successor.value);
    }
    return node;
  }
  return deleteNode(newRoot, value);
}

export const TREE_CODE: Record<string, string[]> = {
  Insert: INSERT_CODE,
  Search: SEARCH_CODE,
  Inorder: INORDER_CODE,
  Preorder: PREORDER_CODE,
  Postorder: POSTORDER_CODE,
};
