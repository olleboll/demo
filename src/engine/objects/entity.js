// @flow

import { DropShadowFilter } from 'pixi-filters';

import PIXI, { getResource } from 'engine';
import { calculateDistance, Point } from 'engine/utils';

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
  position: Point,
  speed: number,
  world: PIXI.Container,
};

const createEntity = (opts: EntityOptions): Entity => {
  const { spritesheet, position, speed: _speed, world } = opts;

  const container = new PIXI.Container();
  const movementSprites = setUpSprites(spritesheet);
  const movement = {
    up: false,
    down: false,
    left: false,
    right: false,
  };
  let speed = _speed;
  let currentSprite = movementSprites.down;
  container.position.x = position.x;
  container.position.y = position.y;
  container.addChild(currentSprite);

  const swapSprite = (newSprite) => {
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
    if (isPlaying) {
      currentSprite.animationSpeed = 0.1;
      currentSprite.play();
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

const setUpSprites = (sheet) => {
  const { animations } = getResource(sheet, 'spritesheet');
  const up = new PIXI.AnimatedSprite(animations[`${characters.player}3`]);
  const down = new PIXI.AnimatedSprite(animations[`${characters.player}0`]);
  const left = new PIXI.AnimatedSprite(animations[`${characters.player}1`]);
  const right = new PIXI.AnimatedSprite(animations[`${characters.player}2`]);

  up.animationSpeed = 0.1;
  down.animationSpeed = 0.1;
  left.animationSpeed = 0.1;
  right.animationSpeed = 0.1;

  return { up, down, left, right };
};

export { createEntity };
