// @flow
import { DropShadowFilter } from 'pixi-filters';

import PIXI, { getResource } from 'engine';
import { evaluateMove } from 'engine/utils';
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
  controls: any,
  sightRange: number,
};

type PlayerOptions = EntityOptions & {
  controls: any,
};
const createPlayer = (opts: PlayerOptions): Player => {
  const { spritesheet, spriteKey, position, controls, world } = opts;
  const speed = 4;
  const sightRange = 300;
  let { container, currentSprite, movementSprites, swapSprite } = createEntity({
    spritesheet,
    spriteKey,
    position,
    speed,
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

  const setCurrentSprite = (sprite) => {
    currentSprite = sprite;
  };

  const animate = (delta) => {
    Object.keys(controls).forEach((key) => {
      movement[key] = controls[key].isDown;
    });

    const { x, y } = evaluateMove(
      delta,
      {
        position,
        speed,
        currentSprite,
        moveRequest: movement,
        movementSprites,
        swapSprite,
        setCurrentSprite,
      },
      [],
      {
        maxX: world.width / 2,
        maxY: world.height / 2,
        minX: -world.width / 2,
        minY: -world.height / 2,
      },
    );

    position.x = x;
    position.y = y;
    container.position.x = position.x;
    container.position.y = position.y;
  };

  console.log(world.width);

  return {
    container,
    swapSprite,
    currentSprite,
    movementSprites,
    movement,
    speed,
    sightRange,
    position,
    animate,
    controls,
  };
};

const setUpSprites = (sheet) => {
  const { animations } = getResource(sheet, 'spritesheet');
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
