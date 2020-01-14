import { StaticObject } from 'engine/objects';

import { dash, MagicMissile } from 'game/actions';

class Pickup extends StaticObject {
  constructor(props) {
    super(props);
    this.world = props.world;
  }
  onCollision(entity) {
    console.log('picked up');

    this.magicLaser = new MagicMissile({});
    this.magicLaser.equip(entity);
    this.world.removeChild(this);
    this.destroy();
  }
}

export default Pickup;
