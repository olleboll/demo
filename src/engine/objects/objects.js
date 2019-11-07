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
};

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

  container.getLosBounds = () => bounds;

  container.getCollisionBox = () => bounds;

  return {
    container,
    fogOfWarContainer,
    position,
    container,
    sprite,
  };
};

export { createObject };
