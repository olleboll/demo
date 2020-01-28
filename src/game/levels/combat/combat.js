import Level from 'engine/level';

import { StaticObject } from 'engine/objects';
import { characters, objects, animals } from 'game/sprites';

import { generateRandomPoint, generateFreePosition } from 'engine/utils';

import { createEnemy, createReinDeer } from 'game/entities/factory';

class CombatLevel extends Level {
  constructor(props) {
    super(props);
    this.name = 'combat';
    this.dealDamage = props.dealDamage;
    this.enemies = [];

    const enemyPos = { x: -1200, y: -1200 };

    const enemy = createEnemy({
      spritesheet: 'movements',
      spriteKey: characters.assassin,
      position: enemyPos,
      world: this.scene,
      speed: 2,
      level: this,
      dealDamage: this.dealDamage,
      remove: this.respawnEnemy,
      ai: 'idle',
    });
    console.log(enemy);
    this.enemies.push(enemy);

    this.enemies.forEach((enemy) => this.addChild(enemy));

    console.log(this.scene.width);
    console.log(this.scene.height);
  }

  update(delta, player) {
    super.update(delta, player);
    this.enemies.forEach((enemy) => {
      enemy.update(delta, this.visible.children, player, this.sceneSize);
    });
  }

  respawnEnemy = (entity) => {
    this.enemies = this.enemies.filter((e) => e !== entity);
    const enemyPos = { x: -1200, y: -1200 };
    const enemy = createEnemy({
      spritesheet: 'movements',
      spriteKey: characters.assassin,
      position: enemyPos,
      world: this.scene,
      speed: 2,
      level: this,
      dealDamage: this.dealDamage,
      remove: this.respawnEnemy,
      ai: 'idle',
    });
    console.log(enemy);
    this.enemies.push(enemy);
    this.enemies.forEach((enemy) => this.addChild(enemy));
  };
}

export default CombatLevel;
