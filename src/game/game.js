//@flow
import PIXI from 'engine';
import { createKeyboardControls } from 'engine/controls';
import { createEntity } from 'engine/objects';
import { createLevel } from 'engine/level';

import { characters as _characters } from './sprites';

import { createPlayer } from './entities';

// TYPES
import type { Level, LevelOptions } from 'engine/level';

const Game = ({ renderer, ticker, stage: _stage }) => {
  const stage = new PIXI.Container();
  const levelOptions: LevelOptions = {
    name: 'map',
    spriteKey: 'map',
    centerCamera: true,
    renderer,
  };
  const level: Level = createLevel(levelOptions);
  stage.addChild(level.scene);

  let player;
  let characters = [];

  const animate = (delta) => {
    player.animate(delta);
    level.updateCamera(player.position, player.sightRange);
  };

  const init = () => {
    for (let i = 0; i < 10; i++) {
      let x =
        -level.scene.width / 2 + Math.floor(Math.random() * level.scene.width);
      let y =
        -level.scene.height / 2 +
        Math.floor(Math.random() * level.scene.height);
      let character = createEntity({
        spritesheet: 'movements2',
        spriteKey: _characters.joker,
        position: { x, y },
        world: level.scene,
      });

      characters.push(character);
      level.addChild(character.container);
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
      spriteKey: _characters.player,
      position: { x: -500, y: 0 },
      controls,
      world: level.scene,
    });
    level.addChild(player.container);
  };

  level.scene.interactive = true;
  level.scene.on('mousedown', (event) => {
    const { x, y } = event.data.global;
    console.log('CLICK AT');
    console.log('screen: ', { x, y });
    console.log('scene: ', level.scene.toLocal({ x, y }));
  });

  console.log('***');
  console.log({ level });

  return {
    stage,
    init,
    animate,
  };
};

export default Game;
