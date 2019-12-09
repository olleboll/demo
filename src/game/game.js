//@flow
import PIXI from 'engine';
import { createKeyboardControls } from 'engine/controls';
import { createEntity, createObject } from 'engine/objects';
import { createEffect } from 'engine/effects';
import { generateRandomPoint, generateFreePosition } from 'engine/utils';

import { characters as _characters, objects } from './sprites';

import { CityLevel, ForestLevel } from './levels';
import { generateRNGTrees } from './levels/utils';
import Medallion from './medallion';
import { Enemy } from './entities';
import { createPlayer, createEnemy } from './entities/factory';
import { createRain } from './weather';
import { createFire } from './objects';

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
    dash: 32,
  };
  const controls = createKeyboardControls(keys);
  const stage = new PIXI.Container();

  const dealDamage = (aoe, damage, friendly = false) => {
    if (friendly) {
      for (let e of enemies) {
        if (aoe.contains(e.position.x, e.position.y)) {
          e.takeDamage(damage);
        }
      }
    } else if (aoe.contains(player.position.x, player.position.y)) {
      player.takeDamage(damage);
    }
  };

  const player = createPlayer({
    spritesheet: 'movements',
    spriteKey: _characters.player,
    position: { x: 0, y: 0 },
    controls,
    speed: 3,
    dealDamage,
    renderer,
  });

  const trees = generateRNGTrees();

  const levelOptions: LevelOptions = {
    name: 'map',
    spriteKey: 'forest',
    centerCamera: true,
    renderer,
    dark: 0.4,
    light: 1.0,
    sceneWidth: 1600,
    sceneHeight: 1600,
    hasCamera: true,
    dealDamage,
    trees,
  };
  const forestLevel = new ForestLevel(levelOptions); //createLevel(levelOptions);

  const levelOptions2: LevelOptions = {
    name: 'map',
    spriteKey: 'city',
    centerCamera: true,
    renderer,
    dark: 0.4,
    light: 1.2,
    sceneWidth: 1600,
    sceneHeight: 1200,
    hasCamera: true,
    dealDamage,
    trees,
  };
  const cityLevel = new CityLevel(levelOptions2); //createLevel(levelOptions);
  const levels = {
    forest: forestLevel,
    city: cityLevel,
  };
  const medallion = new Medallion(levels, 'forest', player, stage);
  const level = medallion.currentLevel;
  /****************/
  // Game objects
  let lightSources = [];
  let enemies = [];

  /****************/

  let counter = 0;
  const animate = (delta: number) => {
    medallion.update(delta);
  };

  const init = () => {
    const opts = {
      width: level.scene.width,
      height: level.scene.height,
      level,
      dealDamage,
    };

    // lightSources = generateRandomTorches(10, opts);
    // lightSources.forEach((torch) => level.addChild(torch.container));

    // const effect = createEffect({
    //   spriteSrc: 'felspell',
    //   spriteKey: 'felspell',
    //   position: { x: 0, y: 0 },
    //   repeat: true,
    //   scale: 1,
    // });
    // level.addChild(effect.container);

    // enemies = generateRandomEnemies(10, opts);
    // enemies.forEach((enemy) => level.addChild(enemy.container));
    // level.setEffect(rain);
  };

  level.scene.interactive = true;
  const swapUniverse = (event) => {
    const { x, y } = event.data.global;
    const target = level.scene.toLocal({ x, y });
    //player.actions.sword.swing(target);
    player.actions.bow.execute('fire', {
      target,
      world: medallion.currentLevel,
    });
    medallion.swapUniverse('city');
  };
  level.scene.on('mouseup', swapUniverse);
  cityLevel.scene.interactive = true;
  cityLevel.scene.on('mouseup', swapUniverse);

  level.scene.on('mousedown', (event) => {
    //player.actions.bow.execute('draw');
  });

  level.scene.on('mousemove', (event) => {
    const { x, y } = event.data.global;
    const aim = level.scene.toLocal({ x, y });
    player.setAim(aim);
  });

  cityLevel.scene.on('mousemove', (event) => {
    const { x, y } = event.data.global;
    const aim = level.scene.toLocal({ x, y });
    player.setAim(aim);
  });

  return {
    stage,
    init,
    animate,
  };
};

const generateRandomTorches = (number, { width, height }) => {
  const lightSources = [];
  for (let i = 0; i < number; i++) {
    const { x, y } = generateRandomPoint({
      minX: -width / 2,
      maxX: width / 2,
      minY: -height / 2,
      maxY: height / 2,
      sizeX: 30,
      sizeY: 30,
    });
    let torch = createFire({ position: { x, y }, radius: 30 });
    lightSources.push(torch);
  }
  return lightSources;
};

const generateRandomTrees = (number, { width, height }) => {
  const trees = [];
  for (let i = 0; i < number; i++) {
    const { x, y } = generateRandomPoint({
      minX: -width / 2,
      maxX: width / 2,
      minY: -height / 2,
      maxY: height / 2,
      sizeX: 64,
      sizeY: 64,
    });
    let tree = createObject({
      spritesheet: 'outside',
      spriteKey: objects.tree,
      position: { x, y },
      width: 64,
      height: 64,
    });
    trees.push(tree);
  }
  return trees;
};

export default Game;
