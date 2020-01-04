import { Howl, Howler } from 'howler';

import PIXI from 'engine';
import Level from 'engine/level';
import { StaticObject } from 'engine/objects';

import { createRain } from 'game/weather';

import { generateRNGTrees, generateRandomEnemies } from './utils';
import { objects } from 'game/sprites';

import { test } from 'game/shaders/test';

class ForestLevel extends Level {
  constructor(props) {
    super(props);
    this.name = 'forest';
    this.dealDamage = props.dealDamage;
    this.trees = props.trees.map((pos) => {
      const sprite = Math.random() > 0.7 ? 'tree' : 'pine_tree';
      return new StaticObject({
        spritesheet: 'outside',
        spriteKey: sprite,
        position: pos,
        width: 64,
        height: 64,
      });
    });
    this.trees.forEach((tree) => this.addChild(tree, tree.fogOfWarContainer));
    this.interactiveObjects = [];
    this.enemies = [];
    this.enemies = generateRandomEnemies(10, {
      width: this.sceneWidth,
      height: this.sceneHeight,
      level: this,
      dealDamage: this.dealDamage,
      remove: this.removeEnemy,
    });
    this.enemies.forEach((enemy) => this.addChild(enemy));

    const rain = createRain({
      position: { x: -750, y: -750 },
      width: 1400,
      height: 1400,
      intensity: 4,
      container: this.visible,
      brightness: 1.0,
    });

    this.setEffect(rain);

    this.ambience = new Howl({
      src: ['/static/audio/helios/guiding_light.mp3'],
      loop: true,
    });

    this.removeEnemy = this.removeEnemy.bind(this);
    // this.onEnter = this.onEnter.bind(this);
    // this.onLeave = this.onLeave.bind(this);
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

export default ForestLevel;
