import { StaticObject } from 'engine/objects';

class Boulder extends StaticObject {
  constructor(props) {
    super(props);
    this.cacheAsBitmap = false;
    this._debug = true;
  }
  interact(medallion) {
    medallion.currentLevel.removeChild(this);
    medallion.player.addChild(this);
    medallion.player.addChild(this.fogOfWarContainer);
    this.position.x = 0;
    this.position.y = 0;
    this.zIndex = 0;
    this.fogOfWarContainer.position.x = 0;
    this.fogOfWarContainer.position.y = 0;
    this.fogOfWarContainer.zIndex = 0;
  }
  stopInteract(medallion) {
    const { player, currentLevel } = medallion;
    currentLevel.addChild(this, this.fogOfWarContainer);
    this.position.x = player.position.x;
    this.position.y = player.position.y;
    this.zIndex = player.position.y;
    this.fogOfWarContainer.position.x = player.position.x;
    this.fogOfWarContainer.position.y = player.position.y;
    this.fogOfWarContainer.zIndex = player.position.y;

    this.recalculateBounds();
  }
}

export default Boulder;
