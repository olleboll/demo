import PIXI from 'engine';

import { getResource } from 'engine';

import { calculateDistance } from 'engine/utils';

import { Enemy } from 'game/entities';

class Sword {
  constructor({ spriteKey, range, targets, dealDamage, player }) {
    const { animations } = getResource('weapons1', 'spritesheet');
    const animationSprite = new PIXI.AnimatedSprite(animations[spriteKey]);
    animationSprite.zIndex = 10;
    animationSprite.position.y -= 10;
    animationSprite.animationSpeed = 0.3;
    animationSprite.loop = false;
    animationSprite.visible = false;
    animationSprite.onComplete = () => {
      animationSprite.visible = false;
      animationSprite.gotoAndStop(0);
    };
    this.animationSprite = animationSprite;
    this.sprite = animationSprite;

    const animationSprite2 = new PIXI.AnimatedSprite(
      animations['sword_swing_3'],
    );
    animationSprite2.zIndex = 10;
    animationSprite2.position.y -= 10;
    animationSprite2.animationSpeed = 0.3;
    animationSprite2.loop = false;
    animationSprite2.visible = false;
    animationSprite2.onComplete = () => {
      animationSprite2.visible = false;
      animationSprite2.gotoAndStop(0);
    };
    this.animationSprite2 = animationSprite2;

    this.isPlayer = player;
    this.range = range;
    this.dealDamage = dealDamage;
    this.swing = this.swing.bind(this);
    this.runAnimation = this.runAnimation.bind(this);
    this.stopAnimation = this.stopAnimation.bind(this);
    this.parent = null;
  }

  setParent(container) {
    this.parent = container;
    this.parent.addChildAt(this.animationSprite);
    this.parent.addChildAt(this.animationSprite2);
  }

  swing(target) {
    const { animationSprite, animationSprite2 } = this;
    if (animationSprite.playing) {
      const { currentFrame: current, totalFrames: total } = animationSprite;

      if (current + 4 >= total) {
        this.stopAnimation(animationSprite);
        this.runAnimation(animationSprite2, target);
      }
      return;
    }
    this.runAnimation(animationSprite, target);
  }

  runAnimation(sprite, target) {
    console.log('runnig ani');
    console.log(this);
    const { parent, isPlayer, range } = this;
    const { dx, dy, distance } = calculateDistance(target, {
      x: parent.position.x,
      y: parent.position.y,
    });

    let rotation = Math.atan(dy / dx);
    if (dx < 0) {
      rotation += Math.PI;
    }

    sprite.zIndex = dy < 0 ? 10 : -10;
    sprite.rotation = rotation + Math.PI / 8;

    sprite.visible = true;
    sprite.play();
    this.sprite = sprite;

    const damageArea = new PIXI.Circle(
      parent.position.x,
      parent.position.y,
      range,
    );
    this.dealDamage(damageArea, 10, isPlayer);
  }
  stopAnimation(sprite) {
    sprite.visible = false;
    sprite.gotoAndStop(0);
  }
}

const createSword = ({
  spriteKey,
  range,
  targets,
  dealDamage,
  player = false,
}) => {
  return new Sword({
    spriteKey,
    range,
    targets,
    dealDamage,
    player,
  });
};

export default Sword;
