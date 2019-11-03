// @flow
import PIXI, { getResource } from 'engine';
import type { Point } from 'engine/utils';

import { characters } from 'game/sprites';

export type Entity = {
  container: PIXI.Container,
  currentSprite: PIXI.AnimatedSprite,
  movementSprites: {
    up: PIXI.AnimatedSprite,
    down: PIXI.AnimatedSprite,
    left: PIXI.AnimatedSprite,
    right: PIXI.AnimatedSprite,
  },
  speed: number,
  position: Point,
  animate: () => void,
  swapSprite: (newSprite: PIXI.AnimatedSprite) => void,
};

export type EntityOptions = {
  spritesheet: string,
  spriteKey: string,
  position: Point,
  speed: number,
};

const createEntity = (opts: EntityOptions): Entity => {
  const { spritesheet, spriteKey, position, speed: _speed } = opts;

  const container = new PIXI.Container();
  const movementSprites = setUpSprites(spritesheet, spriteKey);
  const movement = {
    up: false,
    down: false,
    left: false,
    right: false,
  };
  let speed = _speed;
  let currentSprite = movementSprites.up;
  container.position.x = position.x;
  container.position.y = position.y;
  container.zIndex = container.position.y;
  container.addChild(currentSprite);

  const swapSprite = (newSprite, cb) => {
    if (!newSprite.renderable) {
      console.warn('target sprite is not renderable');
      console.warn(newSprite);
      return;
    }
    const isPlaying = currentSprite.playing;
    if (isPlaying) {
      currentSprite.stop();
    }
    newSprite.position = currentSprite.position;
    container.removeChild(currentSprite);
    container.addChild(newSprite);
    currentSprite = newSprite;
    currentSprite.play();
    if (typeof cb === 'function') {
      cb(newSprite);
    }
  };

  const animate = () => {};

  return {
    container,
    currentSprite,
    movementSprites,
    swapSprite,
    speed,
    position,
    animate,
  };
};

const setUpSprites = (sheet, key) => {
  const { animations } = getResource(sheet, 'spritesheet');
  const up = new PIXI.AnimatedSprite(animations[`${key}3`]);
  const down = new PIXI.AnimatedSprite(animations[`${key}0`]);
  const left = new PIXI.AnimatedSprite(animations[`${key}1`]);
  const right = new PIXI.AnimatedSprite(animations[`${key}2`]);

  up.animationSpeed = 0.1;
  down.animationSpeed = 0.1;
  left.animationSpeed = 0.1;
  right.animationSpeed = 0.1;

  up.anchor.set(0.5, 0.5);
  down.anchor.set(0.5, 0.5);
  left.anchor.set(0.5, 0.5);
  right.anchor.set(0.5, 0.5);

  return { up, down, left, right };
};

export { createEntity };
