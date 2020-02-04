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
  {
    target,
    startPosition,
    velocity,
    onDone,
    world,
    obstacles,
    speed = 12,
    duration = 300,
  },
) => {
  speed = 8;

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
  let rotation = Math.atan(dy / dx) + Math.PI / 2;
  if (dx < 0) rotation += Math.PI;
  animation.rotation = rotation + Math.PI;

  animation.play();
  entity.addChild(animation);

  const timer = (delay) => {
    let id,
      start,
      remaining = delay;
    const paus = () => {
      window.clearTimeout(id);
      remaining -= Date.now() - start;
    };
    const play = () => {
      start = Date.now();
      window.clearTimeout(id);
      id = setTimeout(() => {
        entity.zIndex = entity.position.y;
        animation.destroy();
        onDone();
      }, remaining);
    };
    return {
      paus,
      play,
    };
  };

  const update = (delta, entity, obstacles) => {
    let isMoving = false;
    Object.keys(entity.controls).forEach((key) => {
      if (entity.controls[key].isDown) {
        if (key === 'right') {
          target.x += 100;
        }
        if (key === 'left') {
          target.x -= 100;
        }
        if (key === 'up') {
          target.y -= 100;
        }
        if (key === 'down') {
          target.y += 100;
        }
      }
    });

    const { dx, dy, distance } = calculateDistance(startPosition, target);
    let rotation = Math.atan(dy / dx) + Math.PI / 2;
    if (dx < 0) rotation += Math.PI;
    animation.rotation = rotation + Math.PI;

    velocity.x = dx / distance;
    velocity.y = dy / distance;

    const speedX = velocity.x * speed * delta;
    const speedY = velocity.y * speed * delta;
    let newX = entity.position.x + speedX;
    let newY = entity.position.y + speedY;

    entity.position.x = newX;
    entity.position.y = newY;
    entity.zIndex = entity.position.y;
  };

  return { update, timer };
};

export default dash;
