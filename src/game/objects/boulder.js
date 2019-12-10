import { StaticObject } from 'engine/objects';

class Boulder extends StaticObject {
  constructor(props) {
    super(props);
  }
  interact(medallion) {
    medallion.currentLevel.removeChild(this.container);
    medallion.player.container.addChild(this.container);
    medallion.player.container.addChild(this.fogOfWarContainer);
    this.container.position.x = 0;
    this.container.position.y = 0;
    this.fogOfWarContainer.position.x = 0;
    this.fogOfWarContainer.position.y = 0;
  }
  stopInteract(medallion) {
    const { player, currentLevel } = medallion;
    currentLevel.addChild(this.container, this.fogOfWarContainer);
    this.container.position.x = player.position.x;
    this.container.position.y = player.position.y;
    this.fogOfWarContainer.position.x = player.position.x;
    this.fogOfWarContainer.position.y = player.position.y;
  }
}

export default Boulder;
