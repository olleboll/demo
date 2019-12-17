import PIXI, { getResource } from 'engine';
import {
  reachedTarget,
  calculateDistance,
  evaluateMove,
  checkCollision,
  generateRandomPoint,
} from 'engine/utils';

const dash = (
  entity,
  { target, velocity, onDone, world, obstacles, speed = 12 },
) => {
  const done = {};
  const collision = {};
  const initalObstacles = obstacles;

  const { dx, dy, distance: totalDistance } = calculateDistance(
    entity.position,
    target,
  );

  const { animations } = getResource('dash', 'spritesheet');
  const animation = new PIXI.AnimatedSprite(animations['dash']);
  animation.animationSpeed = 1;
  animation.scale.x = 2;
  animation.scale.y = 2;
  animation.position.y = -20;
  animation.alpha = 1.3;
  animation.loop = true;
  animation.visible = true;
  animation.play();

  const filter = new PIXI.filters.BlurFilter(4);
  world.background.filters = [filter];
  //world.addVisibleFilter('dash', filter);

  let rotation = Math.atan(dy / dx) + Math.PI / 2;
  if (dx < 0) rotation += Math.PI;
  animation.rotation = rotation + Math.PI;
  entity.container.addChild(animation);

  const update = (delta, entity, obstacles) => {
    const { distance } = calculateDistance(entity.position, target);

    if (distance < 60) {
      speed = 6;
    }

    if (distance < 30) {
      speed = 3;
    }

    const speedX = velocity.x * speed * delta;
    const speedY = velocity.y * speed * delta;
    let newX = entity.position.x + speedX;
    let newY = entity.position.y + speedY;

    const { dx, dy } = calculateDistance({ x: newX, y: newY }, target);
    if (done.x || Math.abs(dx) <= Math.abs(velocity.x * speed * delta)) {
      newX = target.x;
      done.x = true;
    }

    if (done.y || Math.abs(dy) <= Math.abs(velocity.y * speed * delta)) {
      newY = target.y;
      done.y = true;
    }

    for (let o of obstacles) {
      if (!done.x && checkCollision(o, { x: newX, y: entity.position.y })) {
        done.x = true;
        target.x = entity.position.x;
        newX = entity.position.x;
      }
      if (!done.y && checkCollision(o, { x: entity.position.x, y: newY })) {
        done.y = true;
        target.y = entity.position.y;
        newY = entity.position.y;
      }
    }

    if (done.x && done.y) {
      entity.position.x = target.x;
      entity.position.y = target.y;
      entity.container.position.x = entity.position.x;
      entity.container.position.y = entity.position.y;
      entity.container.zIndex = entity.position.y;
      animation.destroy();

      world.background.filters = [];

      for (let o of initalObstacles) {
        if (o.removeVisibleFilter) {
          o.removeVisibleFilter('dash');
        }
      }

      onDone(delta);
      return;
    }

    for (let o of obstacles) {
      if (o.addVisibleFilter) {
        o.addVisibleFilter('dash', filter);
      }
    }

    entity.position.x = newX;
    entity.position.y = newY;
    entity.container.position.x = entity.position.x;
    entity.container.position.y = entity.position.y;
    entity.container.zIndex = entity.position.y;
  };

  return { update };
};

export default dash;
