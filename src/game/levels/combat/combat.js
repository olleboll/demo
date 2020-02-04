import Level from 'engine/level';

import { StaticObject } from 'engine/objects';
import { characters, objects, animals } from 'game/sprites';

import { generateRandomPoint, generateFreePosition } from 'engine/utils';

import { createEnemy, createReinDeer } from 'game/entities/factory';

const combatOptions = {
  name: 'map',
  spriteKey: 'forest',
  centerCamera: true,
  dark: 0.0,
  light: 1.0,
  sceneWidth: 3200,
  sceneHeight: 3200,
  hasCamera: true,
};

class CombatLevel extends Level {
  constructor(props) {
    super({ ...props, ...combatOptions });
    this.name = 'combat';
    this.dealDamage = combatOptions.dealDamage;
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
