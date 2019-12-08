//@flow
import * as _ from 'underscore';

import PIXI from 'engine';
declare interface Point {
  x: number;
  y: number;
}

interface Entity {
  container: PIXI.Container;
  position: Point;
  speed: number;
  currentSprite: PIXI.AnimatedSprite;
  moveRequest: MoveRequest;
  movementSprites: {
    up: PIXI.AnimatedSprite,
    down: PIXI.AnimatedSprite,
    left: PIXI.AnimatedSprite,
    right: PIXI.AnimatedSprite,
  };
  aim?: Point;
  getCollisionBox?: () => PIXI.Rectangle;
  swapSprite: (sprite: PIXI.Sprite) => void;
  setCurrentSprite: (sprite: PIXI.Sprite) => void;
}

type MoveRequest = {
  [string]: boolean,
};

interface Bounds {
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
}

export const calculateDistance = (
  s1: Point,
  s2: Point,
): { dx: number, dy: number, distance: number } => {
  let dx = s2.x - s1.x;
  let dy = s2.y - s1.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  return { dx, dy, distance };
};

export const reachedTarget = ({ position, target, offset }) => {
  const { x: px, y: py } = position;
  const { x: tx, y: ty } = target;
  const { x: offsetX, y: offsetY } = offset;
  return (
    px > tx - Math.abs(offsetX) &&
    px < tx + Math.abs(offsetX) &&
    py > ty - Math.abs(offsetY) &&
    py < ty + Math.abs(offsetY)
  );
};

export const checkCollision = (entity: Entity, point: Point) => {
  if (!entity || !entity.getCollisionBox) return false;
  const bounds = entity.getCollisionBox();
  if (bounds.contains(point.x, point.y)) {
    return entity;
  }
  return null;
};

export const evaluateMove = (
  delta: number,
  entity: Entity,
  obstacles: Array<any>,
  bounds: Bounds,
): Point => {
  const { maxX, maxY, minX, minY } = bounds;
  // TODO: Clean this shit up....
  // This is bad and I should feel bad
  // Make the check smoother and make sure the sprite only swaps maximum once per loop.
  let moving = false;
  let newX = entity.position.x;
  let newY = entity.position.y;
  Object.keys(entity.moveRequest).forEach((dir: string) => {
    if (entity.moveRequest[dir]) {
      moving = true;
      if (dir === 'up') {
        newY -= entity.speed * delta;
      } else if (dir === 'down') {
        newY += entity.speed * delta;
      } else if (dir === 'left') {
        newX -= entity.speed * delta;
      } else if (dir === 'right') {
        newX += entity.speed * delta;
      }
    }
  });

  if (entity.aim) {
    const { x, y } = entity.aim;

    const dx = x - entity.position.x;
    const dy = y - entity.position.y;

    const dimension = Math.abs(dx) - Math.abs(dy) > 0 ? 'x' : 'y';

    if (dimension === 'x') {
      if (dx > 0) {
        if (entity.currentSprite !== entity.movementSprites.right) {
          entity.swapSprite(entity.movementSprites.right);
        }
      } else {
        if (entity.currentSprite !== entity.movementSprites.left) {
          entity.swapSprite(entity.movementSprites.left);
        }
      }
    } else {
      if (dy > 0) {
        if (entity.currentSprite !== entity.movementSprites.down) {
          entity.swapSprite(entity.movementSprites.down);
        }
      } else {
        if (entity.currentSprite !== entity.movementSprites.up) {
          entity.swapSprite(entity.movementSprites.up);
        }
      }
    }
  } else {
    if (entity.moveRequest.up) {
      if (entity.currentSprite !== entity.movementSprites.up) {
        entity.swapSprite(entity.movementSprites.up);
      }
    } else if (entity.moveRequest.down) {
      if (entity.currentSprite !== entity.movementSprites.down) {
        entity.swapSprite(entity.movementSprites.down);
      }
    } else if (entity.moveRequest.right) {
      if (entity.currentSprite !== entity.movementSprites.right) {
        entity.swapSprite(entity.movementSprites.right);
      }
    } else if (entity.moveRequest.left) {
      if (entity.currentSprite !== entity.movementSprites.left) {
        entity.swapSprite(entity.movementSprites.left);
      }
    }
  }

  if (!moving) {
    entity.currentSprite.stop();
  } else if (moving && !entity.currentSprite.playing) {
    entity.currentSprite.play();
  }

  let collisionX = false;
  let collisionY = false;

  for (let obj of obstacles) {
    if (obj === entity.container) continue;
    if (
      !collisionX &&
      (checkCollision(obj, { x: newX, y: entity.position.y }) ||
        (newX < minX || newX > maxX))
    ) {
      collisionX = true;
    }
    if (
      !collisionY &&
      (checkCollision(obj, { x: entity.position.x, y: newY }) ||
        (newY < minY || newY > maxY))
    ) {
      collisionY = true;
    }
  }

  let newPosX = collisionX ? entity.position.x : newX;
  let newPosY = collisionY ? entity.position.y : newY;

  return { x: newPosX, y: newPosY };
};

type BoxPoint = {
  x: number,
  y: number,
  n: string,
  distance?: number,
};

let counter = 0;

export const calculateFieldOfView = (
  fov: PIXI.Graphics,
  graphics: PIXI.Graphics,
  pos: Point,
  obstacles: Array<PIXI.Container>,
  r: number,
  mid: Point,
  parent: PIXI.Container,
) => {
  const visibleObjects = obstacles.filter((sprite) => {
    if (!sprite) {
      return false;
    }
    if (sprite.los) {
      return false;
    }

    if (sprite.name === 'backgroundImage') {
      return false;
    }
    return fov.contains(sprite.x, sprite.y);
  });
  counter++;
  if (counter === 200) {
    console.log('**** DEBUG ***');
    console.log(obstacles);
    console.log(obstacles.length);
    console.log(visibleObjects);
    console.log(visibleObjects.length);
  }
  const lines = visibleObjects
    .filter((obj) => obj.getLosBounds)
    .map((obj) => {
      let { x: bX, y: bY, width, height } = obj.getLosBounds(); // (obj.getBox !== undefined) ?  obj.getBox() : obj.getBounds()

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
      let returnPoints = [possiblePoints[1], possiblePoints[2]]; //.sort( (a, b) => a.distance.dx - b.distance.dx)
      //console.log({returnPoints})
      let lines = {
        p1: returnPoints[0],
        p2: returnPoints[1],
        p3: possiblePoints[3],
      };
      let { dx, dy } = calculateDistance(lines.p1, lines.p2);
      let midpoint = obj.position; //{x: lines.p2.x + dx, y: lines.p2.y + dy}
      return {
        p1: lines.p1,
        p2: lines.p2,
        midpoint,
        p3: lines.p3,
        intersect: false,
      };
    });

  const drawingPoints = [];
  let r2 = r;
  let rotation = 722;
  let lastI = -1;
  for (let i = 0; i < rotation; i++) {
    let angle = (0.5 * i * Math.PI) / 180;
    let x = pos.x + Math.cos(angle) * r;
    let y = pos.y + Math.sin(angle) * r;
    let far = { x, y };
    let check = { p1: pos, p2: far };

    for (let line of lines) {
      if (intersects(check.p1, check.p2, line.p1, line.p2)) {
        line.intersect = true;
      } else {
        line.intersect = false;
      }
    }

    let intersectingLines = lines.filter((line) => line.intersect);
    if (intersectingLines.length > 0) {
      let closestLine = findClosestIntersectingLines(pos, intersectingLines);

      let g = { p1: pos, p2: closestLine };
      let { distance, dx, dy } = calculateDistance(pos, closestLine.p1);
      x = pos.x + Math.cos(angle) * distance;
      y = pos.y + Math.sin(angle) * distance;
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

export const getLinesOfRect = ({ x, y, width, height }) => {
  let p1 = {
    x: x,
    y: y,
  };
  let p2 = {
    x: x + width,
    y: y + height,
  };
  let p3 = {
    x: x - width,
    y: y + height,
  };
  let p4 = {
    x: x - width,
    y: y - height,
  };

  return [
    { p1, p2 },
    { p1: p2, p2: p3 },
    { p1: p3, p2: p4 },
    { p1: p4, p2: p1 },
  ];
};

export const findClosestIntersectingLines = (pos, lines) =>
  lines.sort((a, b) => {
    let { distance: dA } = calculateDistance(pos, a.midpoint);
    let { distance: dB } = calculateDistance(pos, b.midpoint);
    return dA - dB;
  })[0];

type Viewport = {
  totalWidth: number,
  totalHeight: number,
  viewWidth: number,
  viewHeight: number,
  farPos: Point,
  nearPos: Point,
};
export const adjustCenterToViewport = (viewport: Viewport, pos: Point) => {
  const {
    totalWidth,
    totalHeight,
    viewWidth,
    viewHeight,
    farPos,
    nearPos,
  } = viewport;
  const coords = {};
  if (Math.abs(pos.x) < totalWidth / 2 - viewWidth / 2) {
    coords.x = viewWidth / 2;
  } else if (pos.x > 0) {
    let diff = pos.x - (totalWidth / 2 - viewWidth / 2);
    coords.x = viewWidth / 2 + diff;
  } else {
    let diff = Math.abs(pos.x) - (totalWidth / 2 - viewWidth / 2);
    coords.x = viewWidth / 2 - diff;
  }
  if (Math.abs(pos.y) < totalHeight / 2 - viewHeight / 2) {
    coords.y = viewHeight / 2;
  } else if (pos.y > 0) {
    let diff = pos.y - (totalHeight / 2 - viewHeight / 2);
    coords.y = viewHeight / 2 + diff;
  } else {
    let diff = Math.abs(pos.y) - (totalHeight / 2 - viewHeight / 2);
    coords.y = viewHeight / 2 - diff;
  }
  return coords;
};

export const adjustCoordToViewPort = (viewport: Viewport, pos: Point) => {
  const {
    totalWidth,
    totalHeight,
    viewWidth,
    viewHeight,
    farPos,
    nearPos,
  } = viewport;
  const coords = {};
  if (pos.x > nearPos.x && pos.x < farPos.x) {
    let diff = pos.x - nearPos.x;
    coords.x = diff;
  } else if (pos.x > farPos.x) {
    let diff = pos.x - farPos.x;
    coords.x = viewWidth + diff;
  } else {
    let diff = nearPos.x - pos.x;
    coords.x = pos.x - diff;
  }

  if (pos.y > nearPos.y && pos.y < farPos.y) {
    let diff = pos.y - nearPos.y;
    coords.y = diff;
  } else if (pos.y > farPos.y) {
    let diff = pos.y - farPos.y;
    coords.y = viewHeight + diff;
  } else {
    let diff = pos.y - nearPos.y;
    coords.y = pos.y + diff;
  }
  return coords;
};

type input = {
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  sizeX: number,
  sizeY: number,
};
export const generateRandomPoint = (input: input) => {
  const { minX, maxX, minY, maxY, sizeX, sizeY } = input;
  let x = minX + Math.random() * (maxX - minX);
  let y = minY + Math.random() * (maxY - minY);
  let emergencyExit = 0;
  while (x + sizeX > maxX || x - sizeX < minX) {
    x = minX + Math.random() * (maxX - minX);
    emergencyExit++;
    if (emergencyExit > 100000) {
      console.error('Stuck in while loop. exiting!');
      return { x, y };
    }
  }
  emergencyExit = 0;
  while (y + sizeY > maxY || y - sizeY < minY) {
    y = minY + Math.random() * (maxY - minY);
    emergencyExit++;
    if (emergencyExit > 100000) {
      console.error('Stuck in while loop. exiting!');
      return { x, y };
    }
  }

  return { x, y };
};

type circle = {
  x: number,
  y: number,
  r: number,
};

type rect = {
  x: number,
  y: number,
  w: number,
  h: number,
};

export const generateFreePosition = (
  obstacles: Array<PIXI.Container>,
  circle,
  rect,
  size,
  maxTries = 1000,
) => {
  const generatePos = () => {
    let x, y;
    if (circle) {
      x = circle.x - circle.r + Math.random(circle.r * 2);
      y = circle.y - circle.r + Math.random(circle.r * 2);
    } else {
      x = rect.x + Math.random(rect.width);
      y = rect.y + Math.random(rect.height);
    }
    return { x, y };
  };

  let tries;
  let blocked = obstacles.length > 0;
  let x, y;
  while (blocked) {
    const pos = generatePos();
    x = pos.x;
    y = pos.y;
    if (tries > maxTries) {
      console.log('I dont wanna get stuck, bailing.');
      break;
    }
    for (let i = 0; i < obstacles.length; i++) {
      tries++;
      const area = new PIXI.Circle(x, y, size);
      if (area.contains(obstacles[i].position)) {
        console.log('does this run?');
        break;
      } else if (i === obstacles.length - 1) {
        blocked = false;
      }
    }
  }
  return { x, y };
};

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

const intersectionPoint = (x1, y1, x2, y2, x3, y3, x4, y4) => {
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

export const contains = ({ p1, p2, p3, p4 }, { x, y }) => {
  const checkLine = { p1: { x, y }, p2: { x: 10000, y: y } };

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
  return intersections === 1;
};

export const intersects = (p1, p2, p3, p4) => {
  const CCW = (p1, p2, p3) => {
    return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
  };
  return (
    CCW(p1, p3, p4) != CCW(p2, p3, p4) && CCW(p1, p2, p3) != CCW(p1, p2, p4)
  );
};
