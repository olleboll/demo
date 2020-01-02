import { checkCollision } from './checkCollision';

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
    if (!collisionX && checkCollision(obj, { x: newX, y: entity.position.y })) {
      console.log('collisionX');
      console.log(obj);
      collisionX = true;
    }
    if (!collisionY && checkCollision(obj, { x: entity.position.x, y: newY })) {
      console.log('collisionY');
      console.log(obj);
      collisionY = true;
    }
  }

  if (!collisionX && (newX < minX || newX > maxX)) {
    collisionX = true;
  }

  // Divide by tree to accomodate anchor of sprite
  if (
    !collisionY &&
    (newY - entity.currentSprite.height / 3 < minY || newY > maxY)
  ) {
    collisionY = true;
  }

  let newPosX = collisionX ? entity.position.x : newX;
  let newPosY = collisionY ? entity.position.y : newY;

  return { x: newPosX, y: newPosY, collisionX, collisionY };
};
