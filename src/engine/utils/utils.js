//@flow

import PIXI from 'engine';
declare interface Point {
  x: number;
  y: number;
}

interface Entity {
  position: Point;
  speed: number;
  currentSprite: PIXI.AnimatedSprite;
  movementSprites: {
    up: PIXI.AnimatedSprite,
    down: PIXI.AnimatedSprite,
    left: PIXI.AnimatedSprite,
    right: PIXI.AnimatedSprite,
  };
  swapSprite: (sprite: string) => void;
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

export const evaluateMove = (
  delta: number,
  entity: Entity,
  moveRequest: MoveRequest,
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
  Object.keys(moveRequest).forEach((dir: string) => {
    if (moveRequest[dir]) {
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

  if (moveRequest.up) {
    if (entity.currentSprite !== entity.movementSprites.up) {
      entity.swapSprite(entity.movementSprites.up);
    }
  } else if (moveRequest.down) {
    if (entity.currentSprite !== entity.movementSprites.down) {
      entity.swapSprite(entity.movementSprites.down);
    }
  } else if (moveRequest.right) {
    if (entity.currentSprite !== entity.movementSprites.right) {
      entity.swapSprite(entity.movementSprites.right);
    }
  } else if (moveRequest.left) {
    if (entity.currentSprite !== entity.movementSprites.left) {
      entity.swapSprite(entity.movementSprites.left);
    }
  }

  if (!moving) {
    entity.currentSprite.stop();
  } else if (moving && !entity.currentSprite.playing) {
    entity.currentSprite.play();
  }

  return { x: newX, y: newY };
};
