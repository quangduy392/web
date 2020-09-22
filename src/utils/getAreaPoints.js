const getAreaPoints = points => {
    if (!points.length) return [];

    // calculate max and min x and y
    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;

    for (var i = 1; i < points.length; i++) {
        if (points[i].x < minX) minX = points[i].x;
        if (points[i].x > maxX) maxX = points[i].x;
        if (points[i].y < minY) minY = points[i].y;
        if (points[i].y > maxY) maxY = points[i].y;
    }

    // choose a "central" point
    var center = {
        x: minX + (maxX - minX) / 2,
        y: minY + (maxY - minY) / 2
    };

    // precalculate the angles of each point to avoid multiple calculations on sort
    for (let i = 0; i < points.length; i++) {
        points[i].angle = Math.acos((points[i].x - center.x) / lineDistance(center, points[i]));

        if (points[i].y > center.y) {
            points[i].angle = Math.PI + Math.PI - points[i].angle;
        }
    }

    // sort by angle
    return points.sort(function(a, b) {
        return a.angle - b.angle;
    });
};

const lineDistance = (point1, point2) => {
    var xs = 0;
    var ys = 0;

    xs = point2.x - point1.x;
    xs = xs * xs;

    ys = point2.y - point1.y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
};

export default getAreaPoints;
