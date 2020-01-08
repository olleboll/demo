import PIXI from 'engine';

import StaticObject from './static';

class InteractiveObject extends StaticObject {
  constructor(props) {
    super(props);
    this.cacheAsBitmap = false;

    this.interactiveArea = new PIXI.Circle(
      this.position.x,
      this.position.y,
      props.radius,
    );

    this.interact = this.interact.bind(this);
    this.stopInteract = this.stopInteract.bind(this);
    this.update = this.update.bind(this);
  }
  interact() {}
  stopInteract() {}
  update() {}
}

export default InteractiveObject;
