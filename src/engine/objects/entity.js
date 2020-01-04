// @flow
import PIXI, { getResource } from 'engine';
import type { Point } from 'engine/utils';

export type EntityOptions = {
  spritesheet: string,
  spriteKey: string,
  position: Point,
  speed: number,
};

class Entity extends PIXI.Container {
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
    super();
    const { spritesheet, spriteKey, position, speed } = opts;

    this.position.x = position.x;
    this.position.y = position.y;
    this.zIndex = this.position.y;

    this.noCull = true;
    this.filters = [];
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
    this.addChild(this.currentSprite);
    this.addVisibleFilter = this.addVisibleFilter.bind(this);
    this.addFogFilter = this.addFogFilter.bind(this);
    this.removeVisibleFilter = this.removeVisibleFilter.bind(this);
    this.removeFogFilter = this.removeFogFilter.bind(this);
    this.addVisibleFilter = this.addVisibleFilter.bind(this);
    this.removeVisibleFilter = this.removeVisibleFilter.bind(this);
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
    this.removeChild(this.currentSprite);
    this.addChild(newSprite);
    this.currentSprite = newSprite;
    this.currentSprite.play();
  }
  addVisibleFilter(key, filter) {
    const i = this.filters.findIndex((f) => f.key === key);
    if (i !== -1) return;
    filter.key = key;
    this.filters.push(filter);
  }

  removeVisibleFilter(key) {
    const i = this.filters.findIndex((f) => f.key === key);
    this.filters.splice(i, 1);
  }

  addFogFilter(key, filter) {
    // filter.key = key;
    // this.fogOfWarContainer.filters.push(filter);
  }
  removeFogFilter(key) {
    // const i = this.fogOfWarContainer.filters.findIndex((f) => f.key === key);
    // this.fogOfWarContainer.filters.splice(i, 1);
  }
}

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
