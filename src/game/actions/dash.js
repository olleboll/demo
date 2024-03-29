import Ola from 'ola';
import { Howl, Howler } from 'howler';

import PIXI, { getResource } from 'engine';
import {
  reachedTarget,
  calculateDistance,
  evaluateMove,
  checkCollision,
  generateRandomPoint,
} from 'engine/utils';

const sound = new Howl({
  src: ['/static/audio/woosh.m4a'],
  autoplay: true,
  sprite: {
    dash: [4000, 1000],
  },
});

const dash = (
  entity,
  { target, velocity, onDone, world, obstacles, speed = 12 },
) => {
  const done = {};
  const collision = {};
  const initalObstacles = obstacles;
  const maxX = world.sceneSize.width / 2;
  const maxY = world.sceneSize.height / 2;
  const minX = -world.sceneSize.width / 2;
  const minY = -world.sceneSize.height / 2;

  const { dx, dy, distance: totalDistance } = calculateDistance(
    entity.position,
    target,
  );
  const originalSpeed = speed;

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

  // TODO: should probably not hard set the filters of bg sprite
  const filter = new PIXI.filters.BlurFilter(4);
  world.background.filters = [filter];
  //world.addVisibleFilter('dash', filter);

  let rotation = Math.atan(dy / dx) + Math.PI / 2;
  if (dx < 0) rotation += Math.PI;
  animation.rotation = rotation + Math.PI;
  entity.addChild(animation);

  //const soundId = sound.play('dash');

  const currentSpeed = Ola({ value: speed });
  currentSpeed.set({ value: speed / 2 }, 200);

  const update = (delta, entity, obstacles) => {
    const { distance } = calculateDistance(entity.position, target);

    const speed = currentSpeed.value;
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
      if (o.takeDamage || o.jumpable) continue;
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

    if (!done.x && (newX < minX || newX > maxX)) {
      done.x = true;
      target.x = entity.position.x;
      newX = entity.position.x;
    }

    if (
      !done.y &&
      (newY - entity.currentSprite.height / 3 < minY || newY > maxY)
    ) {
      done.y = true;
      target.y = entity.position.y;
      newY = entity.position.y;
    }

    if (done.x && done.y) {
      entity.position.x = target.x;
      entity.position.y = target.y;
      entity.zIndex = entity.position.y;
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
      if (o.addVisibleFilter && !o.isPlayer) {
        o.addVisibleFilter('dash', filter);
      }
    }

    entity.position.x = newX;
    entity.position.y = newY;
    entity.zIndex = entity.position.y;
  };

  return { update };
};

export default dash;
