//@flow
import PIXI from 'engine';
import { createKeyboardControls } from 'engine/controls';
import { createEntity, createObject } from 'engine/objects';
import { createLevel } from 'engine/level';
import { generateRandomPoint } from 'engine/utils';

import { characters as _characters, objects } from './sprites';

import { Player, Enemy } from './entities';
import { createRain } from './weather';
import { createFire } from './objects';

// TYPES
import type { Level, LevelOptions } from 'engine/level';

const Game = ({ renderer, ticker, stage: _stage }) => {
  const stage = new PIXI.Container();
  const levelOptions: LevelOptions = {
    name: 'map',
    spriteKey: 'map',
    centerCamera: true,
    renderer,
    dark: 0.2,
    light: 1.0,
  };
  const level: Level = createLevel(levelOptions);
  stage.addChild(level.scene);
  /****************/
  // Game objects
  let player;
  let trees = [];
  let lightSources = [];
  let enemies = [];

  // const rain = createRain({
  //   position: { x: -500, y: -500 },
  //   width: 1000,
  //   height: 1000,
  //   intensity: 3,
  //   container: level.visible,
  //   brightness: 1.0,
  // });

  /****************/
  let counter = 0;
  const animate = (delta) => {
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
    console.log(dealDamage);
    player = new Player({
      spritesheet: 'movements',
      spriteKey: _characters.player,
      position: { x: -500, y: 0 },
      controls,
      world: level.scene,
      speed: 3,
      dealDamage,
    });
    level.addChild(player.container);
    const opts = {
      width: level.scene.width,
      height: level.scene.height,
      level,
      dealDamage,
      remove,
    };
    trees = generateRandomTrees(100, opts);
    trees.forEach((tree) =>
      level.addChild(tree.container, tree.fogOfWarContainer),
    );

    lightSources = generateRandomTorches(10, opts);
    lightSources.forEach((torch) => level.addChild(torch.container));

    enemies = generateRandomEnemies(10, opts);
    enemies.forEach((enemy) => level.addChild(enemy.container));
    //aalevel.setEffect(rain);
  };

  level.scene.interactive = true;
  level.scene.on('mousedown', (event) => {
    const { x, y } = event.data.global;
    const target = level.scene.toLocal({ x, y });
    player.actions.swing(target);
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
    const enemy = new Enemy({
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
