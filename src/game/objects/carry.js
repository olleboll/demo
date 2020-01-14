import { InteractiveObject } from 'engine/objects';

class CarryObject extends InteractiveObject {
  constructor(props) {
    super(props);
    this.oldPos = {};
  }
  interact(medallion) {
    medallion.currentLevel.removeChild(this);
    medallion.player.addChild(this);
    this.oldPos.x = this.position.x;
    this.oldPos.y = this.position.y;
    this.position.x = 0;
    this.position.y = 0;
    this.zIndex = 0;
  }
  stopInteract(medallion) {
    const { player, currentLevel } = medallion;
    medallion.player.removeChild(this);
    currentLevel.addChild(this);
    this.position.x = player.position.x;
    this.position.y = player.position.y;
    this.zIndex = player.position.y;

    currentLevel.moveObjectInGrid(this, this.oldPos);

    this.recalculateBounds();
  }
  update(delta, medallion) {}
}

export default CarryObject;
