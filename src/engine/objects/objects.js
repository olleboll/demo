// @flow
import PIXI, { getResource } from 'engine';
import type { Point } from 'engine/utils';

export type Object = {
  container: PIXI.Container,
  sprite: PIXI.Sprite,
  position: Point,
};

export type ObjectOptions = {
  spritesheet: string,
  spriteKey: string,
  position: Point,
  width: number,
  height: number,
};

class StaticObject {
  constructor(opts) {
    const { spritesheet, spriteKey, position, width, height } = opts;

    const container = new PIXI.Container();
    const fogOfWarContainer = new PIXI.Container();
    const { textures } = getResource(spritesheet);
    const sprite = new PIXI.Sprite(textures[spriteKey]);
    sprite.anchor.set(0.5, 1);
    container.addChild(sprite);
    container.position.x = position.x;
    container.position.y = position.y;
    container.zIndex = position.y;
    this.sprite = sprite;

    const fogSprite = new PIXI.Sprite(textures[spriteKey]);
    fogSprite.anchor.set(0.5, 1);
    fogOfWarContainer.addChild(fogSprite);
    fogOfWarContainer.position.x = position.x;
    fogOfWarContainer.position.y = position.y;
    fogOfWarContainer.zIndex = position.y;
    this.fogSprite = fogSprite;

    const bWidth = width ? width / 2 : sprite.width;
    const bHeight = height ? height / 2 : sprite.height;
    const bounds = new PIXI.Rectangle(
      position.x - bWidth / 2,
      position.y - bHeight,
      bWidth,
      bHeight,
    );

    container.getCollisionBox = () => bounds;

    this.container = container;
    this.fogOfWarContainer = fogOfWarContainer;
    this.sprite = sprite;
    this.fogSprite = fogSprite;
    this.addVisibleFilter = this.addVisibleFilter.bind(this);
    this.addFogFilter = this.addFogFilter.bind(this);
    this.removeVisibleFilter = this.removeVisibleFilter.bind(this);
    this.removeFogFilter = this.removeFogFilter.bind(this);
  }
  addVisibleFilter(key, filter) {
    const i = this.container.filters.findIndex((f) => f.key === key);
    if (i !== -1) return;
    filter.key = key;
    this.container.filters.push(filter);
  }

  removeVisibleFilter(key) {
    const i = this.container.filters.findIndex((f) => f.key === key);
    this.container.filters.splice(i, 1);
  }

  addFogFilter(key, filter) {
    filter.key = key;
    this.fogOfWarContainer.filters.push(filter);
  }
  removeFogFilter(key) {
    const i = this.fogOfWarContainer.filters.findIndex((f) => f.key === key);
    this.fogOfWarContainer.filters.splice(i, 1);
  }
}

let once = 0;
const createObject = (opts: ObjectOptions): Object => {
  const { spritesheet, spriteKey, position, width, height } = opts;

  const container = new PIXI.Container();
  const fogOfWarContainer = new PIXI.Container();
  const { textures } = getResource(spritesheet);
  const sprite = new PIXI.Sprite(textures[spriteKey]);
  sprite.anchor.set(0.5, 1);
  container.addChild(sprite);
  container.position.x = position.x;
  container.position.y = position.y;
  container.zIndex = position.y;

  const fogSprite = new PIXI.Sprite(textures[spriteKey]);
  fogSprite.anchor.set(0.5, 1);
  fogOfWarContainer.addChild(fogSprite);
  fogOfWarContainer.position.x = position.x;
  fogOfWarContainer.position.y = position.y;
  fogOfWarContainer.zIndex = position.y;

  const bWidth = width ? width / 2 : sprite.width;
  const bHeight = height ? height / 2 : sprite.height;
  const bounds = new PIXI.Rectangle(
    position.x - bWidth / 2,
    position.y - bHeight,
    bWidth,
    bHeight,
  );

  // const debug = new PIXI.Graphics()
  //   .lineStyle(2, 0)
  //   .beginFill(0xffffff, 1)
  //   .drawRect(-bWidth / 2, -bHeight, bWidth, bHeight)
  //   .endFill();
  // container.addChild(debug);
  container.getLosBounds = () => bounds;

  container.getCollisionBox = () => bounds;

  const debugSprite = new PIXI.Graphics()
    .lineStyle(2, 0)
    .beginFill(0xffffff, 1)
    .drawRect(-5, -5, 10, 10)
    .endFill();
  debugSprite.zIndex = 2000;
  container.addChild(debugSprite);
  debugSprite.visible = false;
  container.showDebug = (shouldShow) => {
    // console.log('showing debiug?');
    // console.log(shouldShow);
    debugSprite.visible = shouldShow;
  };

  return {
    container,
    fogOfWarContainer,
    position,
    sprite,
  };
};

export default StaticObject;

export { createObject };
