// @flow
import PIXI from 'engine';

class CollideableObject extends PIXI.Container {
  constructor(opts) {
    super();
    const { position, width, height } = opts;
    const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    sprite.width = width;
    sprite.height = height;
    sprite.renderable = false;
    this.addChild(sprite);
    this.position.x = position.x;
    this.position.y = position.y;

    const bounds = new PIXI.Rectangle(position.x, position.y, width, height);

    this.getCollisionBox = () => bounds;
    this.jumpable = opts.jumpable ? opts.jumpable : false;
  }
}

export default CollideableObject;
