//@flow
import PIXI from 'engine';
import { createKeyboardControls } from 'engine/controls';

import { characters as _characters, objects } from './sprites';

import {
  WinterLevel,
  ForestLevel,
  DesertLevel,
  Elyn,
  CombatLevel,
} from './levels';
import { generateRNGTrees } from './levels/utils';
import { createPlayer } from './entities/factory';
import Controller from './controller';
import Medallion from './medallion';

import { MagicMissile } from 'game/actions';

// TYPES
import type { LevelOptions } from 'engine/level';

type GameOptions = {
  renderer: PIXI.Renderer,
  ticker: PIXI.Ticker,
  stage: PIXI.Container,
};

const Game = (opts: GameOptions) => {
  const { renderer, ticker, stage: _stage } = opts;
  const keys = {
    left: 65,
    right: 68,
    up: 87,
    down: 83,
  };
  const controls = createKeyboardControls(keys);
  const stage = new PIXI.Container();
  const gui = new PIXI.Container();

  const dealDamage = (aoe, damage, friendly = false) => {
    if (aoe.contains(player.position.x, player.position.y)) {
      player.takeDamage(damage);
    }
  };

  const villagePos = { x: -1100, y: -1400 };
  const cliffPos = { x: 150, y: -400 };

  const player = createPlayer({
    spritesheet: 'movements',
    spriteKey: _characters.player,
    position: villagePos,
    controls,
    speed: 2,
    dealDamage,
    renderer,
  });

  const xTreeStart = 56 * 16;
  const yTreeStart = 37 * 16;

  const trees = generateRNGTrees({
    startX: 0,
    startY: 0,
    w: 3200,
    h: 3200,
    mapWidth: 3200,
    mapHeight: 3200,
    size: 25,
  });

  const levelOptions: LevelOptions = {
    name: 'map',
    spriteKey: 'forest',
    centerCamera: true,
    renderer,
    dark: 0.0,
    light: 1.0,
    sceneWidth: 3200,
    sceneHeight: 3200,
    hasCamera: true,
    dealDamage,
    trees,
  };
  const forestLevel = new ForestLevel(levelOptions); //createLevel(levelOptions);

  const combatOptions: LevelOptions = {
    name: 'map',
    spriteKey: 'forest',
    centerCamera: true,
    renderer,
    dark: 0.0,
    light: 1.0,
    sceneWidth: 3200,
    sceneHeight: 3200,
    hasCamera: true,
    dealDamage,
    trees,
  };
  const combatLevel = new CombatLevel(combatOptions); //createLevel(levelOptions);

  const levelOptions2: LevelOptions = {
    name: 'map',
    spriteKey: 'winter',
    centerCamera: true,
    renderer,
    dark: 0,
    light: 1.2,
    sceneWidth: 3200,
    sceneHeight: 3200,
    hasCamera: true,
    dealDamage,
    trees,
  };
  const winterLevel = new WinterLevel(levelOptions2); //createLevel(levelOptions);

  const levelOptions4: LevelOptions = {
    name: 'map',
    spriteKey: 'elyn_big',
    centerCamera: true,
    renderer,
    dark: 0.0,
    light: 1.2,
    sceneWidth: 3200,
    sceneHeight: 3200,
    hasCamera: true,
    dealDamage,
    trees,
  };
  const elyn = new Elyn(levelOptions4); //createLevel(levelOptions);

  const realLevels = {
    forest: forestLevel,
    winter: winterLevel,
    elyn,
  };

  /** FOR DEV */
  // const magicLaser = new MagicMissile({});
  // magicLaser.equip(player);

  const devLevels = {
    combat: combatLevel,
  };
  const medallion = new Medallion(
    realLevels,
    'elyn',
    player,
    stage,
    gui,
    renderer,
  );

  const globalKeys = {
    e: 69,
    y: 89,
    r: 82,
    space: 32,
  };
  const controller = new Controller(medallion, globalKeys);

  const update = (delta: number) => {
    controller.update(delta);
    medallion.update(delta);
  };

  // Sets up bow handler
  // Ok for now...
  forestLevel.scene.interactive = true;
  winterLevel.scene.interactive = true;
  elyn.scene.interactive = true;
  combatLevel.scene.interactive = true;

  const setAim = (event, level) => {
    const { x, y } = event.data.global;
    const aim = level.scene.toLocal({ x, y });
    player.setAim(aim);
  };

  const shootMagicParticle = (event, level) => {
    const { x, y } = event.data.global;
    const target = level.scene.toLocal({ x, y });
    player.executeAction('magic_missile', target, level);
  };

  forestLevel.scene.on('mousemove', (event) => setAim(event, forestLevel));
  forestLevel.scene.on('mousedown', (event) =>
    shootMagicParticle(event, forestLevel),
  );

  winterLevel.scene.on('mousemove', (event) => setAim(event, winterLevel));
  winterLevel.scene.on('mousedown', (event) =>
    shootMagicParticle(event, winterLevel),
  );

  elyn.scene.on('mousemove', (event) => setAim(event, elyn));
  elyn.scene.on('mousedown', (event) => shootMagicParticle(event, elyn));

  combatLevel.scene.on('mousemove', (event) => setAim(event, combatLevel));
  combatLevel.scene.on('mousedown', (event) =>
    shootMagicParticle(event, combatLevel),
  );

  const init = () => {
    console.log('LAUNCHING GAME');
    // On enter music?
    //medallion.currentLevel.onEnter();
  };

  return {
    stage,
    init,
    update,
  };
};

export default Game;
