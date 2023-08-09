import React, { Component } from "react";
import Node from "./Node/Node";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstra";
import { aStarSearch } from "../algorithms/aStarSearch";
import { depthFirstSearch } from "../algorithms/depth_First_Search";
import { breadthFirstSearch } from "../algorithms/breadth_First_Search";
import "./PathfindingVisualizer.css";

// Constants to define the grid size and initial start and finish nodes
const numRows = 20;
const numCols = 50;
const StartNodeRow = 14;
const StartNodeCol = 11;
const FinishNodeRow = 10;
const FinishNodeCol = 30;
let START_NODE_ROW = StartNodeRow;
let START_NODE_COL = StartNodeCol;
let FINISH_NODE_ROW = FinishNodeRow;
let FINISH_NODE_COL = FinishNodeCol;

//////////////////////// PathfindingVisualizer class component
export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    // Component state to store the grid, mouse state, selected algorithm, person, and home nodes
    this.state = {
      grid: [],
      mouseIsPressed: false,
      selectedAlgorithm: "Dijkstra", // Default algorithm: "Dijkstra"
      person: null,
      home: null,
    };
  }

  // Lifecycle method called after the component has been mounted to the DOM
  componentDidMount() {
    // Initialize the grid and set person and home nodes
    const grid = getInitialGrid();
    const person = grid[START_NODE_ROW][START_NODE_COL];
    const home = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    this.setState({ grid, person, home });
    // Event listener to handle clicks outside dropdown menus
    window.addEventListener("click", this.handleWindowClick);
  }

  // Lifecycle method called before the component is unmounted from the DOM
  componentWillUnmount() {
    // Remove the event listener to prevent memory leaks
    window.removeEventListener("click", this.handleWindowClick);
  }

  // Function to toggle the visibility of dropdown menus
  toggleDropdown(button) {
    const dropdownContent = button.nextElementSibling;
    const isDropdownVisible = dropdownContent.style.display === "block";
    // Hide the dropdown content if it is visible
    if (isDropdownVisible) {
      dropdownContent.style.display = "none";
    } else {
      // Hide all other dropdown contents and display the current one
      const allDropdownContents =
        document.querySelectorAll(".dropdown-content");
      allDropdownContents.forEach((content) => {
        content.style.display = "none";
      });
      dropdownContent.style.display = "block";
    }
  }

  // Function to handle clicks on the window, hiding dropdown menus if clicked outside
  handleWindowClick = (event) => {
    const target = event.target;
    // If the clicked element is not part of a dropdown, hide all dropdown contents
    if (
      !target.classList.contains("dropdown-btn") &&
      !target.classList.contains("dropdown-content")
    ) {
      const allDropdownContents =
        document.querySelectorAll(".dropdown-content");
      allDropdownContents.forEach((content) => {
        content.style.display = "none";
      });
    }
  };

  // *************************************************************************************
  // Disable Buttons
  // Function to disable or enable control buttons based on the 'disable' parameter
  // 'disable': Boolean value to disable or enable the buttons
  // *************************************************************************************
  disableControls(disable) {
    const buttons = document.querySelectorAll(".navButton");
    buttons.forEach((button) => {
      button.disabled = disable;
    });
  }

  // *************************************************************************************

  //                                   CLEAR BUTTONS

  // *************************************************************************************
  ////////////////////////////////////// Clear Board
  clearBoard() {
    const { grid } = this.state;
    // Clear animation classes and inline styles for all nodes
    grid.forEach((row) => {
      row.forEach((node) => {
        const nodeElement = document.getElementById(
          `node-${node.row}-${node.col}`
        );
        nodeElement.className = "node";
        nodeElement.removeAttribute("style");
      });
    });
    // Reset the grid to its initial state
    START_NODE_ROW = StartNodeRow;
    START_NODE_COL = StartNodeCol;
    FINISH_NODE_ROW = FinishNodeRow;
    FINISH_NODE_COL = FinishNodeCol;
    this.setState({ grid: getInitialGrid() });
  }

  /////////////////////////////////////// Clear Path
  // Keep walls and start/finish nodes

  clearPath() {
    const { grid, person, home } = this.state;
    grid.forEach((row) => {
      row.forEach((node) => {
        const nodeElement = document.getElementById(
          `node-${node.row}-${node.col}`
        );
        if (!node.isWall) {
          nodeElement.className = "node";
          nodeElement.removeAttribute("style");
        }
      });
    });
    // Create a new grid with the same walls as the current grid
    const newGrid = [];
    for (let row = 0; row < 20; row++) {
      const currentRow = [];
      for (let col = 0; col < 50; col++) {
        const currentNode = grid[row][col];
        if (!currentNode.isWall) {
          currentRow.push(createNode(col, row));
        } else {
          const wallNode = {
            ...currentNode,
            isWall: true,
          };
          currentRow.push(wallNode);
        }
      }
      newGrid.push(currentRow);
    }
    this.setState({ grid: newGrid, person, home });
    return newGrid;
  }

  //**************************************************************
  /////////////////////////////////// Not a button - used in Mazes
  // Function to clear the walls and colors on the board for maze generation
  // The function clears the path as well to avoid issues with maze generation
  clearWalls_Colors() {
    this.clearPath();
    const { grid } = this.state;
    const newGrid = grid.slice(); // Copy the grid
    // Update person and home nodes in the state
    const updatedPerson = newGrid[START_NODE_ROW][START_NODE_COL];
    const updatedHome = newGrid[FINISH_NODE_ROW][FINISH_NODE_COL];
    this.setState({ person: updatedPerson, home: updatedHome });
    // Clear inline styles and create walls
    newGrid.forEach((row) => {
      row.forEach((node) => {
        const nodeElement = document.getElementById(
          `node-${node.row}-${node.col}`
        );
        nodeElement.className = "node";
        nodeElement.removeAttribute("style");
        node.isWall = true;
      });
    });
    newGrid[START_NODE_ROW][START_NODE_COL].isWall = false;
    newGrid[FINISH_NODE_ROW][FINISH_NODE_COL].isWall = false;
    return newGrid;
  }

  // *************************************************************************************

  //                                   Handle Mouse

  // *************************************************************************************
  // Functions to handle mouse events (mousedown, mouseenter, mouseup) on nodes in the grid

  handleMouseDown(row, col) {
    const { grid } = this.state;
    const newGrid = [...grid];
    const node = newGrid[row][col];
    node.isWall = !node.isWall;
    this.setState({ grid: newGrid });
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid });
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false });
  }

  handleDrop(startRow, startCol, row, col) {
    const { grid } = this.state;
    const newGrid = [...grid];
    const startNode = newGrid[startRow][startCol];
    const endNode = newGrid[row][col];
    // Check if the target square is a wall
    if (endNode.isWall) {
      return; // Ignore the drop action
    }
    if (startNode.isStart) {
      // Handle moving the start node to a new position
      startNode.isStart = false;
      endNode.isStart = true;
      START_NODE_ROW = row;
      START_NODE_COL = col;
      this.setState({
        person: { row, col },
      });
    } else if (startNode.isFinish) {
      // Handle moving the finish node to a new position
      startNode.isFinish = false;
      endNode.isFinish = true;
      FINISH_NODE_ROW = row;
      FINISH_NODE_COL = col;
      this.setState({
        home: { row, col },
      });
    }
    this.setState({ grid: newGrid });
    this.clearPath();
  }
  // *************************************************************************************

  //                                       Mazes

  // Functions to generate different types of mazes on the grid
  // *************************************************************************************
  //                                    Random Maze
  // *************************************************************************************
  // Function to generate a random maze by randomly removing walls
  generateRandomMaze() {
    const newGrid = this.clearWalls_Colors();
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const node = newGrid[row][col];
        // Randomly remove walls
        if (Math.random() < 0.7) {
          node.isWall = false;
        }
      }
    }
    this.setState({ grid: newGrid });
    this.clearPath();
  }

  //*************************************************************************************
  //                                     Labyrinth
  //*************************************************************************************
  // Function to generate a labyrinth-like maze using the Recursive Backtracking Algorithm
  generateLabyrinthMaze() {
    const newGrid = this.clearWalls_Colors();
    // Recursive Backtracking Algorithm
    const randomInt = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    const isNodeInGrid = (row, col) => {
      return row >= 0 && row < numRows && col >= 0 && col < numCols;
    };
    const carvePath = (row, col) => {
      newGrid[row][col].isWall = false;
      const directions = [
        [-2, 0], // Up
        [0, 2], // Right
        [2, 0], // Down
        [0, -2], // Left
      ];
      // Shuffle the directions randomly
      for (let i = directions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
      }
      for (let i = 0; i < directions.length; i++) {
        const [dx, dy] = directions[i];
        const newRow = row + dx;
        const newCol = col + dy;

        if (isNodeInGrid(newRow, newCol) && newGrid[newRow][newCol].isWall) {
          newGrid[row + dx / 2][col + dy / 2].isWall = false;
          carvePath(newRow, newCol);
        }
      }
    };
    // Set random start node
    const startRow = randomInt(1, numRows - 1);
    const startCol = randomInt(1, numCols - 1);
    carvePath(startRow, startCol);
    // Set person and home nodes
    newGrid[startRow][startCol].isWall = false;
    newGrid[START_NODE_ROW][START_NODE_COL].isWall = false;
    newGrid[FINISH_NODE_ROW][FINISH_NODE_COL].isWall = false;
    for (let row = 1; row < numRows; row++) {
      for (let col = 1; col < numCols; col++) {
        const node = newGrid[row][col];
        if (Math.random() < 0.05) {
          node.isWall = false;
        }
      }
    }
    this.setState({ grid: newGrid });
    this.clearPath();
  }
  //*************************************************************************************
  //                                        City
  //*************************************************************************************
  // Function to generate a maze with a city-like pattern
  generateCityMaze() {
    const newGrid = this.clearWalls_Colors();

    for (let row = 0; row < numRows; row += 1) {
      for (let col = 0; col < numCols; col += 4) {
        newGrid[row][col].isWall = false;
      }
    }
    for (let row = 0; row < numRows; row += 3) {
      for (let col = 0; col < numCols; col++) {
        newGrid[row][col].isWall = false;
      }
    }
    for (let row = 1; row < numRows; row++) {
      for (let col = 1; col < numCols; col++) {
        const node = newGrid[row][col];
        if (Math.random() < 0.08) {
          node.isWall = true;
        }
      }
    }
    this.setState({ grid: newGrid });
    this.clearPath();
  }
  //*************************************************************************************
  //                                        Eye
  //*************************************************************************************
  // Function to generate a maze in the shape of an eye
  generateEyeMaze() {
    const letterMaze = [
      "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "xxxxxxxxxxxxxxxx                xxxxxxxxxxxxxxxxxx",
      "xxxxxxxxxxxxx                    xxxxxxxxxxxxxxxxx",
      "xxxxxxxxxxxx   xxxxxxxxxxxxxxxx    xxxxxxxxxxxxxxx",
      "xxxxxxxxxxxx xxxxxx x xx xx xxxxxx  xxxxxxxxxxxxxx",
      "xxxxxxxxxxxxxxxxx x x xx xx xxxxxxx  xxxxxxxxxxxxx",
      "xxxxxxxxxxxxxx xx x x x xx xxx xxx    xxxxxxxxxxxx",
      "xxxxxxxxxxxxxxx x             xx x xxxxxxxxxxxxxxx",
      "xxxxxxxxxxxxx xx x    xxx xxx      xxxxxxxxxxxxxxx",
      "xxxxxxxxxxxxxx  xx     xx xxxx   xxxxxxxxxxxxxxxxx",
      "xxxxxxxxxxxx x xxxx      xxxxx xxxxxxxxxxxxxxxxxxx",
      "xxxxxxxxxxxxx  xxxxx    xxxxx  xx xxxxxxxxxxxxxxxx",
      "xxxxxxxxxxxx  xxxxxxxxxxxxxx  x xxxxxxxxxxxxxxxxxx",
      "xxxxxxxxxxx       xxxxxxxx   xxxxxxxxxxxxxxxxxxxxx",
      "xxxxxxxxxxxxxx xx          xx xxxxxxxxxxxxxxxxxxxx",
      "xxxxxxxxxxxxxxxx xx x x xx xxxxxxxxxxxxxxxxxxxxxxx",
      "xxxxxxxxxxxxxxxxxx xx xx xx xxxxxxxxxxxxxxxxxxxxxx",
      "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    ];
    const newGrid = this.clearWalls_Colors();
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        if (letterMaze[row][col] === " ") {
          newGrid[row][col].isWall = false;
        }
      }
    }
    this.setState({ grid: newGrid });
    this.clearPath();
  }

  // *************************************************************************************
  ////////////// Select a new algorithm to visualize
  selectedPathfinder(algorithm) {
    this.setState({ selectedAlgorithm: algorithm });
  }

  // *************************************************************************************

  //                            Visualize Pathfinding Algorithm

  // *************************************************************************************
  /////////////////////////////////////////////////////// Animate Algorithm
  // Function to animate the pathfinding algorithm on the grid, showing visited nodes
  animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder) {
    this.disableControls(true); // Disable controls before animation starts

    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, 10 * i);
    }
  }
  /////////////////////////////////////////////////// Animate Shortest Path
  // Function to animate the shortest path after the pathfinding algorithm has completed
  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortest-path";
      }, 50 * i);
      //////////////////////////////// Enable controls after animations end
      if (i === nodesInShortestPathOrder.length - 1) {
        setTimeout(() => {
          this.disableControls(false);
        }, 50 * i);
      }
    }
  }
  ///////////////////////////////////////////////// Visualize an ALgorithm
  // Function to initiate the visualization of the selected pathfinding algorithm
  visualizeAlgorithm(algorithm) {
    this.clearPath();
    const { grid } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    let visitedNodesInOrder;
    if (algorithm === "Dijkstra") {
      ///////////////////////////////////////////////////////////////////// Dijkstra's Algorithm
      visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    } else if (algorithm === "A*Search") {
      ///////////////////////////////////////////////////////////////////// A* Search
      visitedNodesInOrder = aStarSearch(grid, startNode, finishNode);
    } else if (algorithm === "DFS") {
      ///////////////////////////////////////////////////////////////////// Depth First Search
      visitedNodesInOrder = depthFirstSearch(grid, startNode, finishNode);
    } else if (algorithm === "BFS") {
      ///////////////////////////////////////////////////////////////////// Breadth First Search
      visitedNodesInOrder = breadthFirstSearch(grid, startNode, finishNode);
    }
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
    this.clearPath();
  }

  //******************************************************************************************

  //                                      RENDER

  //******************************************************************************************
  render() {
    const { grid, mouseIsPressed, selectedAlgorithm } = this.state;
    let visualizeButtonText = selectedAlgorithm
      ? `Visualize ${selectedAlgorithm}`
      : "Visualize Dijkstra";

    return (
      <>
        <nav>
          <div className="Title"> Pathfinding Visualizer</div>
          <div className="dropdown">
            <button
              className="dropdown-btn navButton"
              onClick={(e) => this.toggleDropdown(e.target)}
            >
              Algorithms
            </button>
            <div className="dropdown-content">
              <button onClick={() => this.selectedPathfinder("Dijkstra")}>
                Dijkstra
              </button>
              <button onClick={() => this.selectedPathfinder("A*Search")}>
                A* Search
              </button>
              <button onClick={() => this.selectedPathfinder("DepthFS")}>
                Depth FS
              </button>
              <button onClick={() => this.selectedPathfinder("BreadthFS")}>
                Breadth FS
              </button>
            </div>
          </div>

          {/*************************** Mazes **************************/}

          <div className="dropdown">
            <button
              className="dropdown-btn navButton"
              onClick={(e) => this.toggleDropdown(e.target)}
            >
              Maze
            </button>
            <div className="dropdown-content">
              <button
                onClick={() => {
                  this.generateRandomMaze();
                }}
              >
                Random
              </button>
              <button
                onClick={() => {
                  this.generateLabyrinthMaze();
                }}
              >
                Labyrinth
              </button>
              <button
                onClick={() => {
                  this.generateCityMaze();
                }}
              >
                City
              </button>
              <button
                onClick={() => {
                  this.generateEyeMaze();
                }}
              >
                Eye
              </button>
            </div>
          </div>
          {/**************** Clear Path / Board Buttons ***************/}

          <button className="navButton" onClick={() => this.clearPath()}>
            Clear Path
          </button>
          <button className="navButton" onClick={() => this.clearBoard()}>
            Clear Board
          </button>

          {/********************* Visualize Button ********************/}
          <button
            className="navButton"
            onClick={() => {
              if (selectedAlgorithm === "Dijkstra") {
                this.visualizeAlgorithm("Dijkstra");
              } else if (selectedAlgorithm === "A*Search") {
                this.visualizeAlgorithm("A*Search");
              } else if (selectedAlgorithm === "DepthFS") {
                this.visualizeAlgorithm("DFS");
              } else if (selectedAlgorithm === "BreadthFS") {
                this.visualizeAlgorithm("BFS");
              } else {
                this.visualizeAlgorithm("Dijkstra");
              }
            }}
          >
            {visualizeButtonText}
          </button>
          {/***********************************************/}
        </nav>

        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const { row, col, isFinish, isStart, isWall } = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      onDrop={(startRow, startCol, row, col) =>
                        this.handleDrop(startRow, startCol, row, col)
                      }
                      row={row}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}
//*********************************************************************************************

//                                         GRID

//*********************************************************************************************
// Function to initialize the grid with nodes
const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < numRows; row++) {
    const currentRow = [];
    for (let col = 0; col < numCols; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

// Function to create a node for the grid
const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

// Function to toggle a node's wall state in the grid
const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
