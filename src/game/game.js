//@flow
import PIXI from 'engine';
import { createKeyboardControls } from 'engine/controls';
import { createEntity, createObject } from 'engine/objects';
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

  const dealDamage = (aoe, damage, friendly = false) => {
    if (aoe.contains(player.position.x, player.position.y)) {
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
    dark: 0.0,
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
    spriteKey: 'winter',
    centerCamera: true,
    renderer,
    dark: 0.4,
    light: 1.2,
    sceneWidth: 1600,
    sceneHeight: 1600,
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
    dark: 0.8,
    light: 1.1,
    sceneWidth: 1600,
    sceneHeight: 1600,
    hasCamera: true,
    dealDamage,
    trees,
  };
  const desertLevel = new DesertLevel(levelOptions3); //createLevel(levelOptions);

  const levelOptions4: LevelOptions = {
    name: 'map',
    spriteKey: 'forest',
    centerCamera: true,
    renderer,
    dark: 0.8,
    light: 1.2,
    sceneWidth: 1600,
    sceneHeight: 1600,
    hasCamera: true,
    dealDamage,
    trees,
  };
  const elyn = new Elyn(levelOptions4); //createLevel(levelOptions);

  const levels = {
    forest: forestLevel,
    winter: winterLevel,
    desert: desertLevel,
    elyn,
  };
  const medallion = new Medallion(levels, 'elyn', player, stage);
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
  const shoot = (event, level) => {
    const { x, y } = event.data.global;
    const target = level.scene.toLocal({ x, y });
    //player.actions.sword.swing(target);
    player.actions.bow.execute('fire', {
      target,
      world: medallion.currentLevel,
    });
  };

  const setAim = (event, level) => {
    const { x, y } = event.data.global;
    const aim = level.scene.toLocal({ x, y });
    player.setAim(aim);
  };

  forestLevel.scene.on('mouseup', (event) => shoot(event, forestLevel));
  forestLevel.scene.on('mousemove', (event) => setAim(event, forestLevel));
  forestLevel.scene.on('mousedown', (event) => {
    player.actions.bow.execute('draw');
  });

  winterLevel.scene.on('mouseup', (event) => shoot(event, winterLevel));
  winterLevel.scene.on('mousemove', (event) => setAim(event, winterLevel));
  winterLevel.scene.on('mousedown', (event) => {
    player.actions.bow.execute('draw');
  });

  desertLevel.scene.on('mouseup', (event) => shoot(event, desertLevel));
  desertLevel.scene.on('mousemove', (event) => setAim(event, desertLevel));
  desertLevel.scene.on('mousedown', (event) => {
    player.actions.bow.execute('draw');
  });

  elyn.scene.on('mouseup', (event) => shoot(event, elyn));
  elyn.scene.on('mousemove', (event) => setAim(event, elyn));
  elyn.scene.on('mousedown', (event) => {
    player.actions.bow.execute('draw');
  });

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
