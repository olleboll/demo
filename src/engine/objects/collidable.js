// @flow
import PIXI from 'engine';

class CollideableObject {
  constructor(opts) {
    const { position, width, height } = opts;
    this.container = new PIXI.Container();
    const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    sprite.width = width;
    sprite.height = height;
    sprite.renderable = false;
    this.container.addChild(sprite);
    this.container.position.x = position.x;
    this.container.position.y = position.y;

    const bounds = new PIXI.Rectangle(position.x, position.y, width, height);

    this.container.getCollisionBox = () => bounds;

    this.container.jumpable = opts.jumpable ? opts.jumpable : false;
  }
}

export default CollideableObject;
