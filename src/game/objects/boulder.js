import { InteractiveObject } from 'engine/objects';

class Boulder extends InteractiveObject {
  constructor(props) {
    super(props);
    this.oldPos = {};
  }
  interact(medallion) {
    console.log('ibnteracting');
    medallion.currentLevel.removeChild(this);
    console.log(medallion.player.children);
    medallion.player.addChild(this);
    console.log(medallion.player.children);

    console.log(this);

    this.oldPos.x = this.position.x;
    this.oldPos.y = this.position.y;
    this.position.x = 0;
    this.position.y = 0;
    this.zIndex = 0;
  }
  stopInteract(medallion) {
    console.log('stopped interacting');
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

export default Boulder;
