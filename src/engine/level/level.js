// @flow
//import { AlphaFilter } from 'pixi-filters';

import PIXI, { getResource } from 'engine';

import type { Entity } from 'engine/objects';
import type { Point } from 'engine/utils';

import { calculateFieldOfView, adjustCenterToViewport } from 'engine/utils';

export type Level = {
  name: string,
  scene: PIXI.Container,
  visible: PIXI.Container,
  fogOfWar: PIXI.Container,
  mask: Pixi.Container,
  addChild: (entity: Entity, shouldBeInFogOfWar: boolean) => void,
  centerCamera: (center: Point, fovRange: number) => {},
  animate: () => void,
  destroy: () => void,
};

export type LevelOptions = {
  name: string,
  spriteKey: string,
  centerCamera: boolean,
  renderer: PIXI.Renderer,
};

const createLevel = (opts: LevelOptions): Level => {
  const { name, renderer } = opts;

  const scene = new PIXI.Container();
  const visible = new PIXI.Container();
  const fogOfWar = new PIXI.Container();
  const mask = new PIXI.Container();

  const { textures } = getResource('map');

  const background = new PIXI.Sprite(textures.map);
  background.zIndex = -background.height / 2;
  background.name = 'backgroundImage';
  background.position.x = -background.width / 2;
  background.position.y = -background.height / 2;
  visible.addChild(background);
  visible.sortableChildren = true;
  visible.mask = mask;

  const staticBackground = new PIXI.Sprite(textures.map);
  staticBackground.zIndex = -staticBackground / 2;
  staticBackground.name = 'backgroundImage';
  staticBackground.position.x = -staticBackground.width / 2;
  staticBackground.position.y = -staticBackground.height / 2;
  fogOfWar.addChild(staticBackground);
  fogOfWar.sortableChildren = true;
  fogOfWar.filters = [new PIXI.filters.AlphaFilter(0.6)];

  scene.addChild(fogOfWar);
  scene.addChild(visible);

  const addChild = (entity: PIXI.Container, shouldBeInFogOfWar?: boolean) => {
    visible.addChild(entity);
    if (shouldBeInFogOfWar) {
      fogOfWar.addChild(entity);
    }
  };

  // CAMERA STUFF
  // Should be moved so own object/file
  const SCENE_WIDTH = background.width;
  const SCENE_HEIGHT = background.height;
  const SCREEN_MID_X = renderer.width / 2;
  const SCREEN_MID_Y = renderer.height / 2;

  scene.position.x = SCREEN_MID_X;
  scene.position.y = SCREEN_MID_Y;

  let visibleMask;
  const updateCamera = (center: Point, fovRange: number) => {
    let mid = {};
    // Not used now but will be
    const rendererPositionFar = scene.toLocal({
      x: renderer.width,
      y: renderer.height,
    });

    const rendererPositionNear = scene.toLocal({
      x: 0,
      y: 0,
    });

    if (Math.abs(center.x) < SCENE_WIDTH / 2 - SCREEN_MID_X) {
      scene.pivot.x = center.x;
      scene.position.x = SCREEN_MID_X;
    } else if (center.x > 0) {
      scene.pivot.x = SCENE_WIDTH / 2 - SCREEN_MID_X;
    } else {
      scene.pivot.x = -SCENE_WIDTH / 2 + SCREEN_MID_X;
    }
    if (Math.abs(center.y) < SCENE_HEIGHT / 2 - SCREEN_MID_Y) {
      scene.pivot.y = center.y;
      scene.position.y = SCREEN_MID_Y;
    } else if (center.y > 0) {
      scene.pivot.y = SCENE_HEIGHT / 2 - SCREEN_MID_Y;
    } else {
      scene.pivot.y = -SCENE_HEIGHT / 2 + SCREEN_MID_Y;
    }

    mid = adjustCenterToViewport(
      {
        totalWidth: SCENE_WIDTH,
        totalHeight: SCENE_HEIGHT,
        viewWidth: renderer.width,
        viewHeight: renderer.height,
        farPos: rendererPositionFar,
        nearPos: rendererPositionNear,
      },
      center,
    );
    mask.removeChild(visibleMask);
    visibleMask = calculateFieldOfView(
      new PIXI.Circle(center.x, center.y, fovRange),
      PIXI.Graphics,
      center,
      visible,
      fovRange,
      mid,
      visible,
    );
    mask.addChild(visibleMask);
  };

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
    addChild,
    updateCamera,
    animate,
    destroy,
  };
};

export { createLevel };
