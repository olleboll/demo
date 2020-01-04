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

class StaticObject extends PIXI.Container {
  constructor(opts) {
    super();
    const {
      spritesheet,
      spriteKey,
      position,
      width,
      height,
      backgroundObject = false,
      collidable = true,
      los = true,
    } = opts;

    const fogOfWarContainer = new PIXI.Container();
    const { textures } = getResource(spritesheet);
    const sprite = new PIXI.Sprite(textures[spriteKey]);
    sprite.anchor.set(0.5, 1);
    this.addChild(sprite);
    this.position.x = position.x;
    this.position.y = position.y;
    this.zIndex = position.y;
    this.cacheAsBitmap = true;
    this.sprite = sprite;

    const fogSprite = new PIXI.Sprite(textures[spriteKey]);
    fogSprite.anchor.set(0.5, 1);
    fogOfWarContainer.addChild(fogSprite);
    fogOfWarContainer.position.x = position.x;
    fogOfWarContainer.position.y = position.y;
    fogOfWarContainer.zIndex = position.y;
    fogOfWarContainer.cacheAsBitmap = true;

    this.bWidth = width ? width / 2 : sprite.width;
    this.bHeight = height ? height / 2 : sprite.height;
    this.bounds = new PIXI.Rectangle(
      position.x - this.bWidth / 2,
      position.y - this.bHeight,
      this.bWidth,
      this.bHeight,
    );

    if (collidable) {
      this.getCollisionBox = () => this.bounds;
    }

    if (los) {
      this.getLosBounds = () => this.bounds;
    }

    this.fogOfWarContainer = fogOfWarContainer;
    this.sprite = sprite;
    this.fogSprite = fogSprite;
    this.backgroundObject = backgroundObject;
    this.recalculateBounds = this.recalculateBounds.bind(this);
    this.addVisibleFilter = this.addVisibleFilter.bind(this);
    this.removeVisibleFilter = this.removeVisibleFilter.bind(this);
  }
  recalculateBounds() {
    this.bounds = new PIXI.Rectangle(
      this.position.x - this.bWidth / 2,
      this.position.y - this.bHeight,
      this.bWidth,
      this.bHeight,
    );
  }
  addVisibleFilter(key, filter) {
    if (!this.filters) {
      this.filters = [];
    }
    const i = this.filters.findIndex((f) => f.key === key);
    if (i !== -1) return;
    filter.key = key;
    this.filters.push(filter);
  }

  removeVisibleFilter(key) {
    if (!this.filters) return;
    const i = this.filters.findIndex((f) => f.key === key);
    if (i === -1) return;
    this.filters.splice(i, 1);
  }

  addFogFilter(key, filter) {
    if (!this.fogOfWarContainer.filters) {
      this.fogOfWarContainer.filters = [];
    }
    filter.key = key;
    this.fogOfWarContainer.filters.push(filter);
  }
  removeFogFilter(key) {
    const i = this.fogOfWarContainer.filters.findIndex((f) => f.key === key);
    this.fogOfWarContainer.filters.splice(i, 1);
  }
}

export default StaticObject;
