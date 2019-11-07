import PIXI from 'engine';

import { getResource } from 'engine';

import { calculateDistance } from 'engine/utils';

import { Enemy } from 'game/entities';

const createSword = ({
  container,
  spriteKey,
  range,
  targets,
  dealDamage,
  player = false,
}) => {
  const { animations } = getResource('weapons1', 'spritesheet');
  console.log(animations);
  const animationSprite = new PIXI.AnimatedSprite(animations[spriteKey]);
  console.log(animationSprite);
  container.addChildAt(animationSprite);
  animationSprite.zIndex = 10;
  animationSprite.position.y -= 10;
  animationSprite.animationSpeed = 0.3;
  animationSprite.loop = false;
  animationSprite.visible = false;

  const animationSprite2 = new PIXI.AnimatedSprite(animations['sword_swing_3']);
  container.addChildAt(animationSprite2);
  animationSprite2.zIndex = 10;
  animationSprite2.position.y -= 10;
  animationSprite2.animationSpeed = 0.3;
  animationSprite2.loop = false;
  animationSprite2.visible = false;

  const swing = (target) => {
    if (animationSprite.playing) {
      const { currentFrame: current, totalFrames: total } = animationSprite;

      if (current + 4 >= total) {
        stopAnimation(animationSprite);
        runAnimation(animationSprite2, target);
      }
      return;
    }
    runAnimation(animationSprite, target);
  };

  const runAnimation = (sprite, target) => {
    const { dx, dy, distance } = calculateDistance(target, {
      x: container.position.x,
      y: container.position.y,
    });

    let rotation = Math.atan(dy / dx);
    if (dx < 0) {
      rotation += Math.PI;
    }

    sprite.zIndex = dy < 0 ? 10 : -10;
    sprite.rotation = rotation + Math.PI / 8;

    sprite.visible = true;
    sprite.play();

    const damageArea = new PIXI.Circle(
      container.position.x,
      container.position.y,
      range,
    );
    dealDamage(damageArea, 10, player);
  };

  const stopAnimation = (sprite) => {
    sprite.visible = false;
    sprite.gotoAndStop(0);
  };

  animationSprite.onComplete = () => {
    animationSprite.visible = false;
    animationSprite.gotoAndStop(0);
  };

  animationSprite2.onComplete = () => {
    animationSprite2.visible = false;
    animationSprite2.gotoAndStop(0);
  };

  return {
    sprite: animationSprite,
    swing,
  };
};

export default createSword;
