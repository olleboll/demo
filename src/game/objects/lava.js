import { CollideableObject } from 'engine/objects';

class LavaObject extends CollideableObject {
  constructor(props) {
    super(props);
  }
  onCollision(entity) {
    entity.die();
  }
}

export default LavaObject;
