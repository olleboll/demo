import PIXI from 'engine';
import _ from 'underscore';

import { calculateDistance } from './calculateDistance';
import {
  intersects,
  findClosestIntersectingLines,
  contains,
  intersectionPoint,
} from './intersections';

export const calculateFieldOfView = (
  fov: PIXI.Graphics,
  graphics: PIXI.Graphics,
  pos: Point,
  obstacles: Array<PIXI.Container>,
  r: number,
  mid: Point,
  parent: PIXI.Container,
) => {
  const visibleObjects = obstacles;
  // const visibleObjects = obstacles.filter((sprite) => {
  //   if (!sprite) {
  //     return false;
  //   }
  //   if (sprite.los) {
  //     return false;
  //   }
  //
  //   if (!sprite.getLosBounds) {
  //     return false;
  //   }
  //
  //   if (sprite.name === 'backgroundImage') {
  //     return false;
  //   }
  //   return fov.contains(sprite.x, sprite.y);
  // });
  const lines = visibleObjects
    .filter((obj) => obj.getLosBounds)
    .map((obj) => {
      let { x: bX, y: bY, width, height } = obj.getLosBounds();

      let p1: BoxPoint = {
        x: bX + width / 6,
        y: bY + height / 6,
        n: 'topleft',
      };
      let p2: BoxPoint = {
        x: bX + width / 6,
        y: bY - height / 6 + height,
        n: 'bottomleft',
      };
      let p3: BoxPoint = {
        x: bX - width / 6 + width,
        y: bY + height / 6,
        n: 'topright',
      };
      let p4: BoxPoint = {
        x: bX - width / 6 + width,
        y: bY - height / 6 + height,
        n: 'bottomright',
      };

      p1.distance = calculateDistance(pos, p1).distance;
      p2.distance = calculateDistance(pos, p2).distance;
      p3.distance = calculateDistance(pos, p3).distance;
      p4.distance = calculateDistance(pos, p4).distance;

      let possiblePoints = _.sortBy([p1, p2, p3, p4], (a) => a.distance);
      let lines = {
        p1: possiblePoints[1],
        p2: possiblePoints[2],
        p3: possiblePoints[3],
      };
      let midpoint = obj.position;
      return {
        p1: lines.p1,
        p2: lines.p2,
        midpoint,
      };
    });

  const drawingPoints = [];
  let r2 = r;
  let rotation = 722;
  let lastI = -1;
  for (let i = 0; i < rotation; i++) {
    const angle = (0.5 * i * Math.PI) / 180;
    let x = pos.x + Math.cos(angle) * r;
    let y = pos.y + Math.sin(angle) * r;
    const far = { x, y };
    const check = { p1: pos, p2: far };
    const intersectingLines = [];
    for (let line of lines) {
      if (intersects(check.p1, check.p2, line.p1, line.p2)) {
        intersectingLines.push(line);
      }
    }

    if (intersectingLines.length > 0) {
      const closestLine = findClosestIntersectingLines(pos, intersectingLines);

      const g = { p1: pos, p2: closestLine };
      const { distance, dx, dy } = calculateDistance(pos, closestLine.p1);
      x = pos.x + Math.cos(angle) * (distance + 10);
      y = pos.y + Math.sin(angle) * (distance + 10);
      drawingPoints.push({ x, y });
    } else {
      drawingPoints.push({ x, y });
    }
  }

  let playerArea = new graphics()
    .lineStyle(2, 0)
    .beginFill(0xffffff, 1)
    .moveTo(mid.x, mid.y);
  for (let i = 0; i < drawingPoints.length; i++) {
    playerArea.lineTo(
      drawingPoints[i].x + (mid.x - pos.x),
      drawingPoints[i].y + (mid.y - pos.y),
    );
  }
  playerArea.endFill();

  return playerArea;
};

export const calculateFieldOfView2 = (
  fov: PIXI.Graphics,
  graphics: PIXI.Graphics,
  pos: Point,
  obstacles: Array<PIXI.Container>,
  r: number,
  mid: Point,
  parent: PIXI.Container,
) => {
  const lines = obstacles
    .filter((sprite) => {
      if (!sprite) {
        return false;
      }
      if (sprite.los) {
        return false;
      }

      if (!sprite.losLines) {
        return false;
      }

      if (sprite.name === 'backgroundImage') {
        return false;
      }

      const p1 = { x: pos.x - r, y: pos.y - r };
      const p2 = { x: pos.x + r, y: pos.y - r };
      const p3 = { x: pos.x + r, y: pos.y + r };
      const p4 = { x: pos.x - r, y: pos.y + r };
      return contains({ p1, p2, p3, p4 }, { x: sprite.x, y: sprite.y }, r);
    })
    .reduce((lines, sprite) => {
      lines.push(...sprite.losLines.lines);
      return lines;
    }, []);

  //
  // const lines = visibleObjects
  //   .filter((obj) => obj.getLosBounds)
  //   .map((obj) => {
  //     let { x: bX, y: bY, width, height } = obj.getLosBounds();
  //
  //     let p1: BoxPoint = {
  //       x: bX + width / 6,
  //       y: bY + height / 6,
  //       n: 'topleft',
  //     };
  //     let p2: BoxPoint = {
  //       x: bX + width / 6,
  //       y: bY - height / 6 + height,
  //       n: 'bottomleft',
  //     };
  //     let p3: BoxPoint = {
  //       x: bX - width / 6 + width,
  //       y: bY + height / 6,
  //       n: 'topright',
  //     };
  //     let p4: BoxPoint = {
  //       x: bX - width / 6 + width,
  //       y: bY - height / 6 + height,
  //       n: 'bottomright',
  //     };
  //
  //     p1.distance = calculateDistance(pos, p1).distance;
  //     p2.distance = calculateDistance(pos, p2).distance;
  //     p3.distance = calculateDistance(pos, p3).distance;
  //     p4.distance = calculateDistance(pos, p4).distance;
  //
  //     let possiblePoints = _.sortBy([p1, p2, p3, p4], (a) => a.distance);
  //     let returnPoints = [possiblePoints[1], possiblePoints[2]]; //.sort( (a, b) => a.distance.dx - b.distance.dx)
  //     //console.log({returnPoints})
  //     let lines = {
  //       p1: returnPoints[0],
  //       p2: returnPoints[1],
  //       p3: possiblePoints[3],
  //     };
  //     let { dx, dy } = calculateDistance(lines.p1, lines.p2);
  //     let midpoint = obj.position; //{x: lines.p2.x + dx, y: lines.p2.y + dy}
  //     return {
  //       p1: lines.p1,
  //       p2: lines.p2,
  //       midpoint,
  //       p3: lines.p3,
  //       intersect: false,
  //     };
  //   });

  const drawingPoints = [];
  const rotation = 722;
  for (let i = 0; i < rotation; i++) {
    const angle = (0.5 * i * Math.PI) / 180;
    let x = pos.x + Math.cos(angle) * r;
    let y = pos.y + Math.sin(angle) * r;
    const far = { x, y };
    const check = { p1: pos, p2: far };
    const intersectingLines = [];
    let closestLine = undefined;
    let closestIntersecionPoint = { x, y };
    let closestDistance = r;

    for (let line of lines) {
      const point = intersectionPoint(check.p1, check.p2, line.p1, line.p2);
      if (point) {
        const { distance } = calculateDistance(pos, point);
        if (!closestLine || closestDistance > distance) {
          closestIntersecionPoint = point;
          closestDistance = distance;
        }
      }
    }
    if (closestDistance < r) {
      x = pos.x + Math.cos(angle) * closestDistance;
      y = pos.y + Math.sin(angle) * closestDistance;
      drawingPoints.push({ x, y });
    }
    drawingPoints.push({ x, y });

    // if (intersectingLines.length > 0) {
    //   let closestLine = findClosestIntersectingLines(pos, intersectingLines);
    //
    //   let g = { p1: pos, p2: closestLine };
    //   let { distance, dx, dy } = calculateDistance(pos, closestLine.p1);
    //   x = pos.x + Math.cos(angle) * distance;
    //   y = pos.y + Math.sin(angle) * distance;
    //   drawingPoints.push({ x, y });
    // } else {
    //   drawingPoints.push({ x, y });
    // }
  }

  let playerArea = new graphics()
    .lineStyle(2, 0)
    .beginFill(0xffffff, 1)
    .moveTo(mid.x, mid.y);
  for (let i = 0; i < drawingPoints.length; i++) {
    playerArea.lineTo(
      drawingPoints[i].x + (mid.x - pos.x),
      drawingPoints[i].y + (mid.y - pos.y),
    );
  }
  playerArea.endFill();

  return playerArea;
};
