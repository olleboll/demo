import PIXI from 'engine';

//import { createSword } from 'game/actions';
import Sword from 'game/actions/sword';
import Bow from 'game/actions/bow';

import ReinDeer from './animals/reindeer';
import Player from './player';
import Enemy from './enemy';

export const createPlayer = ({
  spritesheet,
  spriteKey,
  position,
  controls,
  world,
  speed,
  dealDamage,
  renderer,
}) => {
  // const sword = new Sword({
  //   spriteKey: 'sword_swing_4',
  //   range: 50,
  //   dealDamage,
  //   player: true,
  // });

  const bow = new Bow({
    spriteKey: 'sword_swing_4',
    dealDamage,
    player: true,
    world,
    renderer,
  });

  console.log('sword created');
  console.log(bow);

  const playerAbilities = {
    // sword: {
    //   swing: sword.swing,
    //   coolDown: () => false,
    // },
    bow,
  };

  const player = new Player({
    spritesheet,
    spriteKey,
    position,
    controls,
    world,
    speed,
    actions: playerAbilities,
  });

  bow.setParent(player.container);

  console.log('player created');
  console.log(player);

  return player;
};

export const createEnemy = ({
  spritesheet,
  spriteKey,
  position,
  controls,
  world,
  speed,
  dealDamage,
  remove,
  level,
}) => {
  const sword = new Sword({
    spriteKey: 'sword_swing_4',
    range: 50,
    dealDamage,
    player: false,
  });

  const enemyAbilities = {
    sword: {
      swing: sword.swing,
      coolDown: () => sword.sprite.playing,
    },
  };

  const enemy = new Enemy({
    spritesheet,
    spriteKey,
    position,
    world,
    level,
    speed,
    dealDamage,
    remove,
    actions: enemyAbilities,
  });

  sword.setParent(enemy.container);

  return enemy;
};

export const createReinDeer = ({
  spritesheet,
  spriteKey,
  position,
  controls,
  world,
  speed,
  dealDamage,
  remove,
  level,
}) => {
  return new ReinDeer({
    spritesheet,
    spriteKey,
    position,
    controls,
    world,
    speed,
    dealDamage,
    remove,
    level,
  });
};
