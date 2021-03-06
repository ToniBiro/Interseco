from flask import Flask, abort, request, jsonify
from flask_cors import CORS

from prgc.dcel import DCEL
from prgc.intersect import intersect_polygons
from prgc.primitive import Vector2D
from prgc.primitive import compute_area, compute_perimeter, determine_polygon_type


app = Flask(__name__)

# CORS is a required security feature to allow the front end
# to send requests to the back end.
CORS(app)


@app.route('/get_intersection', methods=['POST'])
def compute_intersection():
    """
    Computes the resulting polygon from the intersection of 2 polygons

    Accepts from POST request 2 polygons.
    Input: (json format)2 lists of points.
    e.g.
    {
            'polygon1': [(0, 0), (1, 0), (1, 1), (0, 1)],
            'polygon2': [(0.5, -0.25), (1.25, -0.25), (1.25, 1.5), (0.5, 1.5)]
    }

    Returns: a list of points representing the polygon formed after the intersection.
    * If there are more than 1 resulting polygon
    e.g.
    {
            'points_1': [[1, 1], [0.5, 1.0], [0.5, 0.0], [1, 0]]
            'points_2': ....
             ....
    }

    """
    # read json data from input
    data = request.get_json()
    if data is None:
        return abort(400)

    try:
        polygon1_aux = data['polygon1']
        polygon2_aux = data['polygon2']
        if not isinstance(polygon1_aux, list):
            raise TypeError
        if not isinstance(polygon2_aux, list):
            raise TypeError
    except (AttributeError, TypeError, ValueError):
        return abort(400)

    if len(polygon1_aux) == 0 or len(polygon2_aux) == 0:
        return jsonify({'length': 0})

    dcel = DCEL()

    polygon1 = []
    for point in polygon1_aux:
        polygon1.append(Vector2D(point[0], point[1]))

    polygon1 = dcel.create_face_from_points(polygon1)

    polygon2 = []
    for point in polygon2_aux:
        polygon2.append(Vector2D(point[0], point[1]))
    polygon2 = dcel.create_face_from_points(polygon2)

    insect = intersect_polygons(dcel, polygon1, polygon2)

    # Extract the result
    json_resp = {'length': len(insect)}
    for i in range(len(insect)):
        json_resp['polygon_' + str(i)] = []

    # create json response
    for i, polygon in enumerate(insect):
        for edge in polygon:
            json_resp['polygon_' +
                      str(i)].append((edge.target.point.x, edge.target.point.y))

    return jsonify(json_resp)


@app.route('/get_polygon_info', methods=['POST'])
def get_polygon_info():
    """
    Returns information about a given polygon as json
    Input: A list of points
    e.g. { 'polygon' : [(0, 0), (1, 0), (1, 1), (0, 1)] }

    Returns: A dictionary wtih area, perimeter and polygon type (concave, convex)
    e.g. polygon_info = {
        'area' : 1,
        'perimeter' : 4,
        'type' : 'concave'
    }
    """
    # read json data from input
    data = request.get_json()
    if data is None:
        return abort(400)

    try:
        polygon = data['polygon']
        if not isinstance(polygon, list):
            raise ValueError
    except (AttributeError, TypeError, ValueError):
        return abort(400)

    polygon_info = {
        'area': 0,
        'perimeter': 0,
        'type': None
    }

    if len(polygon) != 0:
        # compute the information
        polygon_info['area'] = compute_area(polygon)
        polygon_info['perimeter'] = compute_perimeter(polygon)
        polygon_info['type'] = determine_polygon_type(polygon)

    return jsonify(polygon_info)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001)
