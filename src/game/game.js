//@flow
import PIXI from 'engine';
import { createKeyboardControls } from 'engine/controls';
import { createEntity, createObject } from 'engine/objects';
import { createLevel } from 'engine/level';
import { generateRandomPoint, generateFreePosition } from 'engine/utils';

import { characters as _characters, objects } from './sprites';

import { Enemy } from './entities';
import { createPlayer, createEnemy } from './entities/factory';
import { createRain } from './weather';
import { createFire } from './objects';

// TYPES
import type { Level, LevelOptions } from 'engine/level';

type GameOptions = {
  renderer: PIXI.Renderer,
  ticker: PIXI.Ticker,
  stage: PIXI.Container,
};

const Game = (opts: GameOptions) => {
  const { renderer, ticker, stage: _stage } = opts;
  const stage = new PIXI.Container();
  const levelOptions: LevelOptions = {
    name: 'map',
    spriteKey: 'map',
    centerCamera: true,
    renderer,
    dark: 0.2,
    light: 1.0,
    hasCamera: true,
  };
  const level: Level = createLevel(levelOptions);
  stage.addChild(level.scene);
  /****************/
  // Game objects
  let player;
  let trees = [];
  let lightSources = [];
  let enemies = [];

  const rain = createRain({
    position: { x: -500, y: -500 },
    width: 1000,
    height: 1000,
    intensity: 3,
    container: level.visible,
    brightness: 1.0,
  });

  /****************/
  let counter = 0;
  const animate = (delta: number) => {
    enemies.forEach((enemy) =>
      enemy.update(delta, level.visible.children, player),
    );
    player.update(delta, level.visible.children);
    level.camera.updateCamera(player.position);
    const fov = level.camera.generateFieldOfView(
      player.position,
      player.sightRange,
      true,
    );
    level.setMask('fieldOfView', fov);
    for (let source of lightSources) {
      let r = source.getNewRadius();
      const mask = level.camera.generateMask(source.container.position, r);
      level.setMask(source.id, mask);
    }
    level.animate(delta);
  };

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

  const remove = (entity) => {
    enemies = enemies.filter((e) => e !== entity);
    console.log('enemies remaining: ', enemies.length);
    if (enemies.length === 0) {
      alert('you win, well done');
      window.location.reload();
    }
  };

  const init = () => {
    const keys = {
      left: 65,
      right: 68,
      up: 87,
      down: 83,
      dash: 32,
    };
    const controls = createKeyboardControls(keys);
    const opts = {
      width: level.scene.width,
      height: level.scene.height,
      level,
      dealDamage,
      remove,
    };

    trees = generateRNGTrees(); //generateRandomTrees(3, opts);
    trees.forEach((tree) =>
      level.addChild(tree.container, tree.fogOfWarContainer),
    );

    const playerPos = generateFreePosition(
      level.scene.children,
      null,
      { x: 0, y: 0, width: level.scene.width, height: level.scene.height },
      40,
    );

    player = createPlayer({
      spritesheet: 'movements',
      spriteKey: _characters.player,
      position: { x: 0, y: 0 },
      controls,
      world: level,
      speed: 3,
      dealDamage,
      renderer,
    });
    level.addChild(player.container);

    lightSources = generateRandomTorches(10, opts);
    lightSources.forEach((torch) => level.addChild(torch.container));

    enemies = generateRandomEnemies(10, opts);
    enemies.forEach((enemy) => level.addChild(enemy.container));
    level.setEffect(rain);
  };

  level.scene.interactive = true;
  level.scene.on('mouseup', (event) => {
    const { x, y } = event.data.global;
    const target = level.scene.toLocal({ x, y });
    //player.actions.sword.swing(target);
    player.actions.bow.execute('fire', target);
  });

  level.scene.on('mousedown', (event) => {
    player.actions.bow.execute('draw');
  });

  level.scene.on('mousemove', (event) => {
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

const generateRandomEnemies = (
  number,
  { width, height, level, dealDamage, remove },
) => {
  const enemies = [];
  for (let i = 0; i < number; i++) {
    const { x, y } = generateRandomPoint({
      minX: -width / 2,
      maxX: width / 2,
      minY: -height / 2,
      maxY: height / 2,
      sizeX: 30,
      sizeY: 30,
    });
    const enemy = createEnemy({
      spritesheet: 'movements2',
      spriteKey: _characters.warrior,
      position: { x, y },
      world: level.scene,
      speed: 2,
      dealDamage,
      remove,
    });
    enemies.push(enemy);
  }
  return enemies;
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

const generateRNGTrees = () => {
  let treeMap = [];

  const chanceToStartAsOpen = 0.2;
  const deathLimit = 2;
  const birthLimit = 5;
  const numberOfSteps = 8;
  const width = 1600 / 25;
  const height = 1600 / 25;

  for (let i = 0; i < width; i++) {
    treeMap[i] = [];
    for (let j = 0; j < height; j++) {
      if (Math.random() < chanceToStartAsOpen) {
        treeMap[i][j] = true;
      } else {
        treeMap[i][j] = false;
      }
    }
  }

  const countNeighbours = (map, x, y) => {
    let count = 0;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        let n_x = x + i;
        let n_y = y + j;

        if (i === 0 && j === 0) {
          continue;
        } else if (
          n_x < 0 ||
          n_y < 0 ||
          n_x >= map.length ||
          n_y >= map[0].length
        ) {
          count++;
        } else if (map[n_x][n_y]) {
          count++;
        }
      }
    }
    return count;
  };

  const doSimulationStep = (map) => {
    const newMap = [];

    for (let i = 0; i < width; i++) {
      newMap[i] = [];
      for (let j = 0; j < height; j++) {
        let nbs = countNeighbours(map, i, j);
        if (map[i][j]) {
          if (nbs < deathLimit) {
            newMap[i][j] = false;
          } else {
            newMap[i][j] = true;
          }
        } else {
          if (nbs > birthLimit) {
            newMap[i][j] = true;
          } else {
            newMap[i][j] = false;
          }
        }
      }
    }
    return newMap;
  };

  for (let i = 0; i < numberOfSteps; i++) {
    treeMap = doSimulationStep(treeMap);
  }
  const trees = [];
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      if (treeMap[i][j] === true) {
        let tree = createObject({
          spritesheet: 'outside',
          spriteKey: objects.tree,
          position: { x: -800 + i * 25, y: -800 + j * 25 },
          width: 64,
          height: 64,
        });
        trees.push(tree);
      }
    }
  }
  return trees;
};
