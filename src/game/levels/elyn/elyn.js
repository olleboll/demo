import { Howl, Howler } from 'howler';

import PIXI from 'engine';
import Level from 'engine/level';
import {
  StaticObject,
  InteractiveObject,
  CollideableObject,
} from 'engine/objects';

import { createRain } from 'game/weather';

import { generateRNGTrees, generateRandomEnemies } from '../utils';
import { objects } from 'game/sprites';
import { createFire, LavaObject, Sign } from 'game/objects';

import { createFromLayer } from 'game/levels/utils/createFromLayer';

import { blackBorderFilter } from 'game/shaders/blackBorder';

import resource from './elyn_big.json';

class Elyn extends Level {
  constructor(props) {
    super(props);

    this.name = 'elyn';
    this.dealDamage = props.dealDamage;

    console.log(resource);

    const fall = createFromLayer(
      resource,
      'water',
      this.sceneWidth,
      this.sceneHeight,
      (data, i) => {
        return new CollideableObject({
          position: data,
          width: 16,
          height: 16,
          jumpable: true,
        });
      },
      false,
    );

    const fall2 = createFromLayer(
      resource,
      'abyss',
      this.sceneWidth,
      this.sceneHeight,
      (data, i) => {
        return new LavaObject({
          position: data,
          width: 16,
          height: 16,
          jumpable: true,
        });
      },
      false,
    );

    const collidable = fall.concat(fall2);

    collidable.forEach((tree) => {
      this.addChild(tree);
    });

    const levelTrees = createFromLayer(
      resource,
      'tree_collision',
      this.sceneWidth,
      this.sceneHeight,
      (data, i) => {
        const sprite = Math.random() > 0.7 ? 'tree' : 'pine_tree';
        return new StaticObject({
          spritesheet: 'outside',
          spriteKey: sprite,
          position: data,
          width: 64,
          height: 64,
        });
      },
    );
    const w = 928;
    const h = 1008;
    const randomTrees = [];

    const genericTrees = [];

    this.trees = levelTrees.concat(randomTrees);

    this.trees.forEach((tree) => {
      this.addChild(tree, tree.fogOfWarContainer);
    });

    const [sign] = createFromLayer(
      resource,
      'sign',
      this.sceneWidth,
      this.sceneHeight,
      (pos) => {
        return new Sign({
          spritesheet: 'outside',
          spriteKey: 'sign_big',
          position: pos,
          los: false,
          radius: 40,
          text:
            'Beware! Without basic magic skills you should not enter here...',
        });
      },
    );

    this.addChild(sign, sign.fogOfWarContainer);

    this.fires = createFromLayer(
      resource,
      'fires',
      this.sceneWidth,
      this.sceneHeight,
      (data, i) => {
        return createFire({ position: data, radius: 50 });
      },
    );

    this.fires.forEach((fire) => {
      this.addChild(fire.container);
    });

    this.interactiveObjects = [sign];
    this.enemies = [];

    this.ambience = new Howl({
      src: ['/static/audio/helios/city_above_the_clouds.mp3'],
      loop: false,
    });
  }
  update(delta, player) {
    super.update(delta, player);
    this.enemies.forEach((enemy) => {
      enemy.update(delta, this.visible.children, player, this.sceneSize);
    });

    this.fires.forEach((fire) => {
      const r = fire.getNewRadius();
      const mask = this.camera.generateMask(fire.container.position, r);
      this.setMask(fire.id, mask);
    });
  }
  removeEnemy(entity) {
    this.enemies = this.enemies.filter((e) => e !== entity);
    console.log('enemies remaining: ', this.enemies.length);
    if (this.enemies.length === 0) {
      alert('you win, well done');
      window.location.reload();
    }
  }
}

export default Elyn;
