import PIXI from 'engine';
import Level from 'engine/level';
import { StaticObject, InteractiveObject } from 'engine/objects';

import { createRain } from 'game/weather';

import { generateRNGTrees, generateRandomEnemies } from '../utils';
import { objects } from 'game/sprites';

import { createFromLayer } from 'game/levels/utils/createFromLayer';

import resource from './elyn.json';

class Elyn extends Level {
  constructor(props) {
    super(props);

    this.name = 'elyn';
    this.dealDamage = props.dealDamage;

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
    const randomTrees = generateRNGTrees({
      startX: 0,
      startY: 597,
      w,
      h,
      mapWidth: this.sceneWidth,
      mapHeight: this.sceneHeight,
      size: 25,
    }).map((pos) => {
      const sprite = Math.random() > 0.7 ? 'tree' : 'pine_tree';
      return new StaticObject({
        spritesheet: 'outside',
        spriteKey: sprite,
        position: pos,
        width: 64,
        height: 64,
      });
    });

    const universalTrees = props.trees.map((pos) => {
      const sprite = Math.random() > 0.7 ? 'tree' : 'pine_tree';
      return new StaticObject({
        spritesheet: 'outside',
        spriteKey: sprite,
        position: pos,
        width: 64,
        height: 64,
      });
    });

    const genericTrees = [];

    this.trees = levelTrees.concat(randomTrees);

    this.trees.forEach((tree) => {
      if (tree.backgroundObject) {
        this.addChild(null, tree.fogOfWarContainer);
      } else {
        this.addChild(tree.container, tree.fogOfWarContainer);
      }
    });

    const [sign] = createFromLayer(
      resource,
      'sign',
      this.sceneWidth,
      this.sceneHeight,
      (pos) => {
        return new InteractiveObject({
          spritesheet: 'outside',
          spriteKey: 'sign_small',
          position: pos,
          los: false,
        });
      },
    );

    this.addChild(sign.container, sign.fogOfWarContainer);
    this.addChild(sign.textContainer);

    this.interactiveObjects = [sign];
    this.enemies = [];
  }
  update(delta, player) {
    super.update(delta, player);
    this.enemies.forEach((enemy) => {
      enemy.update(delta, this.visible.children, player, this.sceneSize);
    });
  }
  removeEnemy = (entity) => {
    this.enemies = this.enemies.filter((e) => e !== entity);
    console.log('enemies remaining: ', this.enemies.length);
    if (this.enemies.length === 0) {
      alert('you win, well done');
      window.location.reload();
    }
  };
}

export default Elyn;