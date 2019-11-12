// @flow
import PIXI, { getResource } from 'engine';
import type { Point } from 'engine/utils';

export type EntityOptions = {
  spritesheet: string,
  spriteKey: string,
  position: Point,
  speed: number,
};

class Entity {
  container: PIXI.Container;
  speed: number;
  position: Point;
  movementSprites: {
    up: PIXI.AnimatedSprite,
    down: PIXI.AnimatedSprite,
    left: PIXI.AnimatedSprite,
    right: PIXI.AnimatedSprite,
  };
  currentSprite: PIXI.AnimatedSprite;
  movementRequest: {
    up: boolean,
    down: boolean,
    left: boolean,
    right: boolean,
  };

  constructor(opts: EntityOptions) {
    const { spritesheet, spriteKey, position, speed } = opts;

    const container = new PIXI.Container();
    container.position.x = position.x;
    container.position.y = position.y;
    container.zIndex = container.position.y;

    this.container = container;
    this.speed = speed;
    this.position = position;
    this.movementSprites = setUpSprites(spritesheet, spriteKey);
    this.currentSprite = this.movementSprites.up;
    this.movementRequest = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
    this.container.addChild(this.currentSprite);
  }

  swapSprite(newSprite: PIXI.AnimatedSprite) {
    if (!newSprite.renderable) {
      console.warn('target sprite is not renderable');
      console.warn(newSprite);
      return;
    }
    const isPlaying = this.currentSprite.playing;
    if (isPlaying) {
      this.currentSprite.stop();
    }
    newSprite.position = this.currentSprite.position;
    this.container.removeChild(this.currentSprite);
    this.container.addChild(newSprite);
    this.currentSprite = newSprite;
    this.currentSprite.play();
  }
}

const setUpSprites = (sheet, key) => {
  const { animations } = getResource(sheet, 'spritesheet');
  console.log(animations);
  const up = new PIXI.AnimatedSprite(animations[`${key}3`]);
  const down = new PIXI.AnimatedSprite(animations[`${key}0`]);
  const left = new PIXI.AnimatedSprite(animations[`${key}1`]);
  const right = new PIXI.AnimatedSprite(animations[`${key}2`]);

  up.animationSpeed = 0.1;
  down.animationSpeed = 0.1;
  left.animationSpeed = 0.1;
  right.animationSpeed = 0.1;

  up.name = 'up';
  down.name = 'down';
  left.name = 'left';
  right.name = 'right';

  up.anchor.set(0.5, 1);
  down.anchor.set(0.5, 1);
  left.anchor.set(0.5, 1);
  right.anchor.set(0.5, 1);

  // up.zIndex = 5;
  // down.zIndex = 5;
  // left.zIndex = 5;
  // right.zIndex = 5;

  return { up, down, left, right };
};

export default Entity;
