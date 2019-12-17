import PIXI from 'engine';
import Level from 'engine/level';
import { createObject } from 'engine/objects';

import { createRain } from 'game/weather';

import { generateRNGTrees, generateRandomEnemies } from './utils';
import { objects } from 'game/sprites';

import { test } from 'game/shaders/test';

class Elyn extends Level {
  constructor(props) {
    super(props);
    this.name = 'elyn';
    this.dealDamage = props.dealDamage;
    this.trees = props.trees.map((pos) => {
      const sprite = Math.random() > 0.7 ? 'tree' : 'pine_tree';
      return createObject({
        spritesheet: 'outside',
        spriteKey: sprite,
        position: pos,
        width: 64,
        height: 64,
      });
    });

    this.trees.forEach((tree) =>
      this.addChild(tree.container, tree.fogOfWarContainer),
    );
    this.interactiveObjects = [];
    this.enemies = [];

    this.enemies = generateRandomEnemies(3, {
      width: this.scene.width,
      height: this.scene.height,
      level: this,
      dealDamage: this.dealDamage,
      remove: this.removeEnemy,
    });
    this.enemies.forEach((enemy) => this.addChild(enemy.container));
  }
  update(delta, player) {
    super.update(delta, player);
    this.enemies.forEach((enemy) => {
      enemy.update(delta, this.visible.children, player, this.sceneSize);
    });
  }
}

export default Elyn;
