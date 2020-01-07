//@flow
import PIXI from 'engine';
import { createKeyboardControls } from 'engine/controls';
import { createEntity, StaticObject } from 'engine/objects';
import { createEffect } from 'engine/effects';
import { generateRandomPoint, generateFreePosition } from 'engine/utils';

import { characters as _characters, objects } from './sprites';

import { WinterLevel, ForestLevel, DesertLevel, Elyn } from './levels';
import { generateRNGTrees } from './levels/utils';
import Medallion from './medallion';
import { Enemy } from './entities';
import { createPlayer, createEnemy } from './entities/factory';
import { createRain } from './weather';
import { createFire } from './objects';
import Controller from './controller';

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

  const player = createPlayer({
    spritesheet: 'movements',
    spriteKey: _characters.player,
    position: { x: 150, y: -400 },
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

  // const trees2 = generateRNGTrees({
  //   startX: 0,
  //   startY: yTreeStart,
  //   w: 3200,
  //   h: 3200 - yTreeStart,
  //   mapWidth: 3200,
  //   mapHeight: 3200,
  //   size: 25,
  // });
  //
  // const trees = trees1.concat(trees2);

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
  const levelOptions3: LevelOptions = {
    name: 'map',
    spriteKey: 'desert',
    centerCamera: true,
    renderer,
    dark: 0,
    light: 1.1,
    sceneWidth: 3200,
    sceneHeight: 3200,
    hasCamera: true,
    dealDamage,
    trees,
  };
  const desertLevel = new DesertLevel(levelOptions3); //createLevel(levelOptions);

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

  const levels = {
    forest: forestLevel,
    winter: winterLevel,
    //desert: desertLevel,
    elyn,
  };
  const medallion = new Medallion(levels, 'elyn', player, stage, gui);
  //medallion.currentLevel.onEnter();

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
  desertLevel.scene.interactive = true;
  elyn.scene.interactive = true;

  const setAim = (event, level) => {
    const { x, y } = event.data.global;
    const aim = level.scene.toLocal({ x, y });
    player.setAim(aim);
  };

  const shootMagicParticle = (event, level) => {
    const { x, y } = event.data.global;
    const target = level.scene.toLocal({ x, y });
    player.shootMagicParticle(target, level);
  };

  forestLevel.scene.on('mousemove', (event) => setAim(event, forestLevel));
  forestLevel.scene.on('mousedown', (event) =>
    shootMagicParticle(event, forestLevel),
  );

  winterLevel.scene.on('mousemove', (event) => setAim(event, winterLevel));
  winterLevel.scene.on('mousedown', (event) =>
    shootMagicParticle(event, winterLevel),
  );

  desertLevel.scene.on('mousemove', (event) => setAim(event, desertLevel));
  desertLevel.scene.on('mousedown', (event) =>
    shootMagicParticle(event, forestLevel),
  );

  elyn.scene.on('mousemove', (event) => setAim(event, elyn));
  elyn.scene.on('mousedown', (event) => shootMagicParticle(event, elyn));

  const init = () => {
    console.log('LAUNCHING GAME');
  };

  return {
    stage,
    init,
    update,
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
    let tree = new StaticObject({
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
