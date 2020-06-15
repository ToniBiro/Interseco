import React, { useState, useEffect } from "react";
import { Stage, Layer } from "react-konva";

import { Provider, useDispatch, useSelector, useStore } from "react-redux";
import {
  addPolygon,
  setCurrentPolygon,
  addVertex,
  setVertexPosition,
} from "../redux/actions";

import Polygon from "./Polygon";
import Vertices from "./Vertices";

import { usePolygonInfo } from "../api";

export default App;

/**
 * Root application component.
 *
 * @component
 */
function App() {
  return (
    <>
      <h1>Polygon Intersection</h1>
      <PolygonDisplay />
    </>
  );
}

function PolygonDisplay() {
  const store = useStore();
  const dispatch = useDispatch();
  const polygons = useSelector((state) => state.polygons);
  const currentPolygonIndex = useSelector((state) => state.currentPolygon);
  const currentPolygon = polygons[currentPolygonIndex];

  const [addingNewVertex, setAddingNewVertex] = useState(false);

  return (
    <>
      {addingNewVertex && <h2>Click anywhere to add a new vertex</h2>}
      {/* draw the polygons on a canvas */}
      <Stage
        width={360}
        height={360}
        onMouseDown={({ target }) => {
          if (addingNewVertex) {
            const position = target.getStage().getPointerPosition();
            dispatch(addVertex(currentPolygonIndex, position));
            setAddingNewVertex(false);
          }
        }}
      >
        <Provider store={store}>
          <Layer>
            {polygons.map((polygon, index) => (
              <Polygon key={index} vertices={polygon.vertices} />
            ))}
            <Vertices
              vertices={currentPolygon.vertices}
              updatePosition={(vertexIndex, x, y) => {
                dispatch(
                  setVertexPosition(currentPolygonIndex, vertexIndex, x, y)
                );
              }}
            />
          </Layer>
        </Provider>
      </Stage>
      {/* user controls */}
      <div>
        <button
          disabled={addingNewVertex}
          type="button"
          onClick={() => dispatch(addPolygon())}
        >
          Add new polygon
        </button>
      </div>
      <PolygonInfo polygon={currentPolygon} />
      {/* textual representation of the polygons */}
      <ul>
        {polygons.map((polygon, index) => (
          <li key={index}>
            Polygon #{index}
            {index !== currentPolygonIndex ? (
              <>
                <button
                  disabled={addingNewVertex}
                  onClick={() => dispatch(setCurrentPolygon(index))}
                  type="button"
                >
                  Make current
                </button>
                <button disabled={addingNewVertex} type="button">
                  Intersect with current
                </button>
              </>
            ) : null}
            <ol>
              {polygon.vertices.map(({ x, y }, index) => (
                <li key={index}>
                  ({x}, {y})
                </li>
              ))}
              {index === currentPolygonIndex && (
                <li style={{ listStyleType: "none" }}>
                  <button
                    disabled={addingNewVertex}
                    onClick={() => setAddingNewVertex(true)}
                    type="button"
                  >
                    Add new vertex
                  </button>
                </li>
              )}
            </ol>
          </li>
        ))}
      </ul>
    </>
  );
}

function PolygonInfo({ polygon }) {
  const { data, error, isPending, run } = usePolygonInfo(polygon);

  useEffect(() => run(), [run, polygon]);

  if (isPending) {
    return "Loading...";
  }
  if (error) {
    return `Something went wrong: ${error.message}`;
  }
  if (data) {
    const perimeter = roundToPrecision(data.perimeter, 2);
    const area = data.area;

    return (
      <>
        <p>Perimeter: {perimeter}</p>
        <p>Area: {area}</p>
      </>
    );
  }
  return "";
}

/**
 * Rounds an input floating point number to a given number of decimals.
 * @param {Number} num the number to round
 * @param {Number} decimals how many decimals after the dot
 */
function roundToPrecision(num, decimals) {
  const p = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * p) / p;
}