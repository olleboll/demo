// @flow
import { DropShadowFilter } from 'pixi-filters';

import PIXI, { getResource } from 'engine';
import { calculateDistance, Point } from 'engine/utils';
import { createEntity } from 'engine/objects/entity';
import type { Entity, EntityOptions } from 'engine/objects/entity';

import { characters } from 'game/sprites';

type Player = Entity & {
  movement: {
    up: boolean,
    down: boolean,
    left: boolean,
    right: boolean,
  },
  position: Point,
  controls: any,
};

type PlayerOptions = EntityOptions & {
  controls: any,
  world: PIXI.Container,
};
const createPlayer = (opts: PlayerOptions): Player => {
  const { spritesheet, position, controls, world } = opts;
  let speed = 5;
  let { container, currentSprite, movementSprites, swapSprite } = createEntity({
    spritesheet,
    position,
    speed,
    world,
  });
  const movement = {
    up: false,
    down: false,
    left: false,
    right: false,
  };
  currentSprite.animationSpeed = 0.1;
  container.position.x = position.x;
  container.position.y = position.y;
  container.addChild(currentSprite);

  const animate = () => {
    let newDir;
    let isMoving = false;
    Object.keys(controls).forEach((key) => {
      if (controls[key].isDown) {
        isMoving = true;
        if (key === 'up') {
          position.y -= 1 * speed;
        }
        if (key === 'down') {
          position.y += 1 * speed;
        }
        if (key === 'right') {
          position.x += 1 * speed;
        }
        if (key === 'left') {
          position.x -= 1 * speed;
        }
        newDir = key;
        container.position.x = position.x;
        container.position.y = position.y;
      } else {
        movement[key] = false;
      }
    });
    if (newDir) {
      movement[newDir] = true;
      swapSprite(movementSprites[newDir]);
    }

    if (isMoving && !currentSprite.playing) {
      currentSprite.play();
    } else if (!isMoving && currentSprite.playing) {
      currentSprite.stop();
    }
  };

  return {
    container,
    swapSprite,
    currentSprite,
    movementSprites,
    movement,
    speed,
    position,
    animate,
    controls,
  };
};

const setUpSprites = (sheet) => {
  const { animations } = getResource(sheet, 'spritesheet');
  console.log(animations);
  console.log(characters);
  const up = new PIXI.AnimatedSprite(animations[`${characters.player}3`]);
  const down = new PIXI.AnimatedSprite(animations[`${characters.player}0`]);
  const left = new PIXI.AnimatedSprite(animations[`${characters.player}1`]);
  const right = new PIXI.AnimatedSprite(animations[`${characters.player}2`]);

  let shadow = new DropShadowFilter();
  shadow.color = 0x3c2020;
  shadow.alpha = 1;
  shadow.blur = 1;
  shadow.angle = 0;
  shadow.distance = 5;

  up.shadow = shadow;
  up.filters = [shadow];

  down.shadow = shadow;
  down.filters = [shadow];

  left.shadow = shadow;
  left.filters = [shadow];

  right.shadow = shadow;
  right.filters = [shadow];

  console.log(shadow);

  up.animationSpeed = 0.1;
  down.animationSpeed = 0.1;
  left.animationSpeed = 0.1;
  right.animationSpeed = 0.1;

  return { up, down, left, right };
};

export { createPlayer };
