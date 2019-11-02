import * as PIXI from 'engine';

// @flow
type Level = {
  name: string,
  scene: PIXI.Container,
  visible: PIXI.Container,
  fogOfWar: PIXI.Container,
  mask: Pixi.Container,
  init: () => void,
  animate: () => void,
  destroy: () => void,
};

type LevelOptions = {
  name: string,
};

const createLevel = (opts: LevelOptions): Level => {
  const { name } = opts;
  const scene = new PIXI.Container();
  const visible = new PIXI.Container();
  const fogOfWar = new PIXI.Container();
  const mask = new PIXI.Container();
  const animate = () => {};
  const destroy = () => {
    scene.destroy({ children: true });
  };

  return {
    name,
    scene,
    visible,
    fogOfWar,
    mask,
    init,
    animate,
    destroy,
  };
};
