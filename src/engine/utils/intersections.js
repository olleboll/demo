import { calculateDistance } from './calculateDistance';

export const findClosestIntersectingLines = (pos, lines) =>
  lines.sort((a, b) => {
    let { distance: dA } = calculateDistance(pos, a.midpoint);
    let { distance: dB } = calculateDistance(pos, b.midpoint);
    return dA - dB;
  })[0];

export const findIntersectingLine = (lines, line) => {
  for (let l of lines) {
    if (intersects(l.p1, l.p2, line.p1, line.p2)) {
      return l;
    }
  }
  return null;
};

export const findIntersectionPoint = (checkLine, lines) => {
  const { p1, p2 } = checkLine;
  const intersectionPoints = [];
  for (let i = 0; i < lines.length; i++) {
    const { p1: p3, p2: p4 } = lines[i];
    const p = intersectionPoint(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
    if (p) {
      intersectionPoints.push(p);
    }
  }
  return intersectionPoints;
};

export const contains = ({ p1, p2, p3, p4 }, { x, y }) => {
  const checkLine = { p1: { x, y }, p2: { x: 3000, y: y } };

  const rLines = [{ p1, p2 }, { p2, p3 }, { p3, p4 }, { p4, p1 }];
  const rLine1 = { p1, p2 };
  const rLine2 = { p1: p2, p2: p3 };
  const rLine3 = { p1: p3, p2: p4 };
  const rLine4 = { p1: p4, p2: p1 };
  let intersections = 0;
  intersections = intersects(checkLine.p1, checkLine.p2, rLine1.p1, rLine1.p2)
    ? intersections + 1
    : intersections;
  intersections = intersects(checkLine.p1, checkLine.p2, rLine2.p1, rLine2.p2)
    ? intersections + 1
    : intersections;
  intersections = intersects(checkLine.p1, checkLine.p2, rLine3.p1, rLine3.p2)
    ? intersections + 1
    : intersections;
  intersections = intersects(checkLine.p1, checkLine.p2, rLine4.p1, rLine4.p2)
    ? intersections + 1
    : intersections;
  return intersections % 2 === 1;
};

export const intersects = (p1, p2, p3, p4) => {
  const CCW = (p1, p2, p3) => {
    return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
  };
  return (
    CCW(p1, p3, p4) != CCW(p2, p3, p4) && CCW(p1, p2, p3) != CCW(p1, p2, p4)
  );
};

export const intersectionPoint = (x1, y1, x2, y2, x3, y3, x4, y4) => {
  // Check if none of the lines are of length 0
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return false;
  }

  let denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

  // Lines are parallel
  if (denominator === 0) {
    return false;
  }

  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return false;
  }

  // Return a object with the x and y coordinates of the intersection
  let x = x1 + ua * (x2 - x1);
  let y = y1 + ua * (y2 - y1);

  return { x, y };
};
