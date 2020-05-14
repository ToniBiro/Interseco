import React from "react";
import { Stage, Layer } from "react-konva";

import { Provider, useDispatch, useSelector, useStore } from "react-redux";
import { addPolygon } from "./actions";

import Polygon from "./components/Polygon";

export default function App() {
  return (
    <>
      <h1>Intersecție de poligoane</h1>
      <PolygonDisplay />
    </>
  );
}

function PolygonDisplay() {
  const store = useStore();
  const dispatch = useDispatch();
  const polygons = useSelector((state) => state);

  return (
    <>
      {/* draw the polygons on a canvas */}
      <Stage width={360} height={360}>
        <Provider store={store}>
          <Layer>
            {polygons.map((_, index) => (
              <Polygon key={index} index={index} />
            ))}
          </Layer>
        </Provider>
      </Stage>
      {/* user controls */}
      <div>
        <button type="button" onClick={() => dispatch(addPolygon())}>
          Add new polygon
        </button>
      </div>
      {/* textual representation of the polygons */}
      <ul>
        {polygons.map((polygon, index) => (
          <li key={index}>
            Polygon #{index}
            <ol>
              {polygon.vertices.map(({ x, y }, index) => (
                <li key={index}>
                  ({x}, {y})
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ul>
    </>
  );
}
