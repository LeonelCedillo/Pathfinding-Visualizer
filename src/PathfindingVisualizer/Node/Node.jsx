import React, { Component } from "react";
import "./Node.css";
import startImage from "../Images/person.svg";
import finishImage from "../Images/home.svg";
import wallImage from "../Images/house2.svg";

export default class Node extends Component {
  // *************************************************************************************
  // Drag and Drop Handlers
  // *************************************************************************************

  // Handle the drag start event for start and finish nodes
  // Sets the data transfer object with the row and column information and sets a custom drag image
  handleDragStart = (event, row, col) => {
    // Store the row and column information in the data transfer object
    event.dataTransfer.setData("row", row);
    event.dataTransfer.setData("col", col);
    // Determine which image to use based on isStart and isFinish props
    const imageSrc = this.props.isStart ? startImage : finishImage;
    // Create a temporary image element to use as the drag image
    const dragImage = new Image();
    dragImage.src = imageSrc;
    // Set the drag image to be used during the drag and drop operation
    event.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  // Handle the drop event
  // Calls the handler to handle the drop event with the row and column information
  handleDrop = (event, row, col) => {
    // Retrieve the row and column information from the data transfer object
    const startRow = parseInt(event.dataTransfer.getData("row"));
    const startCol = parseInt(event.dataTransfer.getData("col"));
    // Call the handler to handle the drop event
    this.props.onDrop(startRow, startCol, row, col);
  };

  // Handle drag over
  // Prevents the default behavior of the browser to allow drop
  handleDragOver = (event) => {
    event.preventDefault();
  };

  // *************************************************************************************
  // Mouse Handlers
  // *************************************************************************************

  // Calls the onMouseDown handler with the row and column information
  // Only allows wall nodes to be toggled if the node is not the start or finish node
  handleMouseDown = (row, col) => {
    const { isStart, isFinish, isWall, onMouseDown } = this.props;
    if (!isStart && !isFinish) {
      if (isWall) {
        onMouseDown(row, col);
      } else {
        onMouseDown(row, col);
      }
    }
  };

  // Calls the onMouseEnter handler with the row and column information
  // Only allows the mouse enter event to be triggered if the node is not the start or finish node
  handleMouseEnter = (row, col) => {
    const { isStart, isFinish, onMouseEnter } = this.props;
    if (!isStart && !isFinish) {
      onMouseEnter(row, col);
    }
  };

  // *************************************************************************************
  // Render
  // *************************************************************************************
  render() {
    const { col, isFinish, isStart, isWall, row } = this.props;
    // Determining the image source based on the node type
    let imageSrc = null;
    if (isStart) {
      imageSrc = startImage;
    } else if (isFinish) {
      imageSrc = finishImage;
    } else if (isWall) {
      imageSrc = wallImage;
    }

    return (
      // Node div element representing a single node on the grid
      <div
        id={`node-${row}-${col}`}
        className={`node ${isWall ? "node-wall" : ""}`} // Add "node-wall" class if the node is a wall
        onMouseDown={() => this.handleMouseDown(row, col)} // Mouse down event handler
        onMouseEnter={() => this.handleMouseEnter(row, col)} // Mouse enter event handler
        onMouseUp={() => this.props.onMouseUp()} // Mouse up event handler from the parent component
        draggable={isStart || isFinish} // Set draggable attribute for start and finish nodes
        onDragStart={(event) => this.handleDragStart(event, row, col)} // Event handler for drag start
        onDragOver={(event) => this.handleDragOver(event)} // Event handler for drag over
        onDrop={(event) => this.handleDrop(event, row, col)} // Event handler for drop
      >
        {/* Render image if imageSrc is available */}
        {imageSrc && <img src={imageSrc} alt="" />}
      </div>
    );
  }
}
