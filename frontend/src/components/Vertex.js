import React from "react";
import { Circle } from "react-konva";

export default function Vertex({ x, y, dragBoundFunc, onDragEnd }) {
  return (
    <Circle
      x={x}
      y={y}
      radius={10}
      fill="red"
      draggable={true}
      dragBoundFunc={dragBoundFunc}
      onDragEnd={onDragEnd}
    />
  );
}
