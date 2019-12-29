import { createObject } from 'engine/objects';
import { generateRandomPoint, generateFreePosition } from 'engine/utils';

import { createEnemy, createReinDeer } from 'game/entities/factory';
import { characters, objects, animals } from 'game/sprites';

export const generateRNGTrees = ({
  startX,
  startY,
  w,
  h,
  size = 25,
  mapWidth,
  mapHeight,
}) => {
  let treeMap = [];

  const chanceToStartAsOpen = 0.3;
  const deathLimit = 2;
  const birthLimit = 5;
  const numberOfSteps = 8;
  const width = w / size;
  const height = h / size;

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
        trees.push({
          x: -mapWidth / 2 + startX + i * size,
          y: -mapHeight / 2 + startY + j * size,
        });
      }
    }
  }
  return trees;
};

export const generateRandomReindeer = (
  number,
  { width, height, level, dealDamage, remove, speed },
) => {
  const reindeer = [];
  for (let i = 0; i < number; i++) {
    const { x, y } = generateRandomPoint({
      minX: -width / 2,
      maxX: width / 2,
      minY: -height / 2,
      maxY: height / 2,
      sizeX: 30,
      sizeY: 30,
    });
    const deer = createReinDeer({
      spritesheet: 'animals5',
      spriteKey: animals.reinDeer,
      position: { x, y },
      world: level.scene,
      speed,
      dealDamage,
      remove,
      level,
    });
    reindeer.push(deer);
  }
  return reindeer;
};

export const generateRandomEnemies = (
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
      spritesheet: 'movements',
      spriteKey: characters.assassin,
      position: { x, y },
      world: level.scene,
      speed: 2,
      dealDamage,
      remove,
      level,
    });
    enemies.push(enemy);
  }
  return enemies;
};
