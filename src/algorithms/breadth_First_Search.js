// Performs Depth-First Search; returns *all* nodes in the order
// in which they were visited.
export function breadthFirstSearch(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  const queue = [startNode];

  while (queue.length !== 0) {
    const currentNode = queue.shift(); // Dequeue the first node in the queue.
    // If we encounter a wall or a node that has already been visited, we skip it.
    if (currentNode.isWall || currentNode.isVisited) continue;

    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);
    if (currentNode === finishNode) return visitedNodesInOrder;

    const neighbors = getUnvisitedNeighbors(currentNode, grid);
    for (const neighbor of neighbors) {
      neighbor.previousNode = currentNode; // Keep track of the path.
      queue.push(neighbor); // Enqueue the neighbor for future exploration.
    }
  }

  return visitedNodesInOrder;
}

function getUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const { col, row } = node;
  const directions = [
    { row: row - 1, col }, // Up
    { row: row + 1, col }, // Down
    { row, col: col - 1 }, // Left
    { row, col: col + 1 }, // Right
  ];

  for (const dir of directions) {
    const { row, col } = dir;
    if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
      const neighbor = grid[row][col];
      if (!neighbor.isVisited && !neighbor.isWall) {
        neighbors.push(neighbor);
      }
    }
  }
  return neighbors;
}

// Reset the visited status of all nodes in the grid.
export function resetGrid(grid) {
  for (const row of grid) {
    for (const node of row) {
      node.isVisited = false;
    }
  }
}
