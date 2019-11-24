// @flow
//import { AlphaFilter } from 'pixi-filters';

import PIXI, { getResource } from 'engine';

import { createCamera } from 'engine/camera';
import type { Entity } from 'engine/objects';
import type { Point } from 'engine/utils';

import {
  calculateFieldOfView,
  adjustCenterToViewport,
  checkCollision,
} from 'engine/utils';

export type Level = {
  name: string,
  scene: PIXI.Container,
  visible: PIXI.Container,
  fogOfWar: PIXI.Container,
  mask: PIXI.Container,
  camera: any,
  addChild: (entity: Entity, shouldBeInFogOfWar: boolean) => void,
  removeChild: (entity: Entity) => void,
  animate: () => void,
  destroy: () => void,
  setMask: (key: string, newMask: any) => void,
  removeMask: (key: string) => void,
  setEffect: (effect: any) => void,
};

export type LevelOptions = {
  name: string,
  spriteKey: string,
  centerCamera: boolean,
  renderer: PIXI.Renderer,
  dark: number,
  light: number,
  hasCamera: boolean,
};

const createLevel = (opts: LevelOptions): Level => {
  const { name, renderer, dark, light, hasCamera = false } = opts;

  const scene = new PIXI.Container();
  const visible = new PIXI.Container();
  const fogOfWar = new PIXI.Container();
  const mask = new PIXI.Container();
  const effects = [];

  const { textures } = getResource('map');

  const background = new PIXI.Sprite(textures.map);
  background.zIndex = -background.height / 2;
  background.name = 'backgroundImage';
  background.position.x = -background.width / 2;
  background.position.y = -background.height / 2;
  visible.addChild(background);
  visible.sortableChildren = true;
  visible.filters = [new PIXI.filters.AlphaFilter(light)];
  visible.mask = mask;

  const staticBackground = new PIXI.Sprite(textures.map);
  staticBackground.zIndex = -staticBackground / 2;
  staticBackground.name = 'backgroundImage';
  staticBackground.position.x = -staticBackground.width / 2;
  staticBackground.position.y = -staticBackground.height / 2;
  fogOfWar.addChild(staticBackground);
  fogOfWar.sortableChildren = true;
  fogOfWar.filters = [new PIXI.filters.AlphaFilter(dark)];

  scene.addChild(fogOfWar);
  scene.addChild(visible);

  scene.visible = visible;

  let camera;
  if (hasCamera) {
    camera = createCamera({ renderer, scene });
  }

  const addChild = (
    entity: PIXI.Container,
    fogOfWarEntity?: PIXI.Container,
  ) => {
    visible.addChild(entity);
    if (fogOfWarEntity) {
      fogOfWar.addChild(fogOfWarEntity);
    }
  };

  const removeChild = (container) => {
    visible.removeChild(container);
    fogOfWar.removeChild(container);
  };

  let visibleMasks = {};
  const setMask = (key, newMask) => {
    if (visibleMasks[key]) {
      visible.mask.removeChild(visibleMasks[key]);
      visibleMasks[key].destroy();
    }
    visible.mask.addChild(newMask);
    visibleMasks[key] = newMask;
  };

  const removeMask = (key) => {
    visible.mask.removeChild(visibleMasks[key]);
    visibleMasks[key].destroy();
    delete visibleMasks[key];
  };
  const setEffect = (effect) => {
    effects.push(effect);
  };
  const animate = (delta) => {
    for (let effect of effects) {
      effect.animate(delta);
    }
  };
  const destroy = () => {
    scene.destroy({ children: true });
  };

  return {
    name,
    scene,
    visible,
    fogOfWar,
    mask,
    camera,
    setMask,
    removeMask,
    addChild,
    removeChild,
    setEffect,
    animate,
    destroy,
  };
};

export { createLevel };
