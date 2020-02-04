import Level from 'engine/level';

import { StaticObject, CollideableObject } from 'engine/objects';
import { characters, objects, animals } from 'game/sprites';

import { generateRandomPoint, generateFreePosition } from 'engine/utils';

import { createEnemy, createReinDeer } from 'game/entities/factory';
import { createFromLayer } from 'game/levels/utils/createFromLayer';

import resource from './clouds.json';

const dashOptions = {
  name: 'map',
  spriteKey: 'clouds',
  centerCamera: true,
  dark: 0.0,
  light: 1.0,
  sceneWidth: 800,
  sceneHeight: 800,
  hasCamera: true,
};

class DashLevel extends Level {
  constructor(props) {
    super({ ...props, ...dashOptions });
    this.name = 'dash';

    console.log('initialized level');
    console.log(this);
    console.log(this.scene.width);
    console.log(this.scene.height);

    console.log(resource);

    const fall = createFromLayer(
      resource,
      'fall',
      this.sceneWidth,
      this.sceneHeight,
      (data, i) => {
        if (data.x < -300) {
          console.log(data);
        }
        return new CollideableObject({
          position: data,
          width: 16,
          height: 16,
          jumpable: true,
        });
      },
      false,
    );
    fall.forEach(this.addChild);
  }

  update(delta, player) {
    super.update(delta, player);
  }
}

export default DashLevel;
