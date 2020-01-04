import { CollideableObject } from 'engine/objects';

class LavaObject extends CollideableObject {
  constructor(props) {
    super(props);
  }
  onCollision(entity) {
    console.log('colliding with lava');
  }
}

export default LavaObject;
