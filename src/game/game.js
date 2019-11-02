import { DropShadowFilter } from 'pixi-filters';

import PIXI, { createPixiApp, getResource } from 'engine';
import { calculateDistance } from 'engine/utils';
import { createKeyboardControls } from 'engine/controls';

import { characters as _characters } from './sprites';

import { createPlayer } from './entities';

const Game = ({ renderer, ticker }) => {
  const stage = new PIXI.Container();
  const world = new PIXI.Container();
  world.light = {};
  stage.addChild(world);
  renderer.backgroundColor = 0xffffff;

  let player;
  let characters = [];
  let posX = renderer.width / 2;
  let posY = renderer.height / 2;

  let debbuger = 0;
  const animate = () => {
    player.animate();
    for (let character of characters) {
      const { dx, dy, distance } = calculateDistance(
        {
          x: posX,
          y: posY,
        },
        {
          x: character.position.x,
          y: character.position.y,
        },
      );
      let angle = Math.atan(dy / -dx);
      if (dx < 0) angle += Math.PI;
      character.shadow.angle = -angle;
      character.shadow.distance = 5;
    }
    world.light.x = posX;
    world.light.y = posY;
  };

  const init = () => {
    for (let i = 0; i < 10; i++) {
      const { animations } = getResource('movements2', 'spritesheet');
      let character = new PIXI.AnimatedSprite(
        animations[`${_characters.joker}0`],
      );

      character.position.x = Math.floor(Math.random() * renderer.width);
      character.position.y = Math.floor(Math.random() * renderer.height);
      character.anchor.set(0.5, 0.5);

      let shadow = new DropShadowFilter();
      shadow.color = 0x3c2020;
      shadow.alpha = 1;
      shadow.blur = 1;
      shadow.angle = 0;
      shadow.distance = 5;

      character.shadow = shadow;
      character.filters = [shadow];
      characters.push(character);
      world.addChild(character);
    }

    const keys = {
      left: 65,
      right: 68,
      up: 87,
      down: 83,
    };
    const controls = createKeyboardControls(keys);
    player = createPlayer({
      spritesheet: 'movements',
      position: { x: 300, y: 300 },
      controls,
      world,
    });
    world.addChild(player.container);

    console.log({ player });
    console.log(world);
  };

  world.interactive = true;
  world.on('mousemove', (event) => {
    const { x, y } = event.data.global;
    posX = x;
    posY = y;
  });

  return {
    stage,
    init,
    animate,
  };
};

export default Game;
