import PIXI from 'engine';

import {
  calculateFieldOfView,
  adjustCenterToViewport,
  adjustCoordToViewPort,
} from 'engine/utils';

const createCamera = ({ renderer, scene }) => {
  const SCENE_WIDTH = scene.width;
  const SCENE_HEIGHT = scene.height;
  const SCREEN_MID_X = renderer.width / 2;
  const SCREEN_MID_Y = renderer.height / 2;

  scene.position.x = SCREEN_MID_X;
  scene.position.y = SCREEN_MID_Y;

  let visibleMask;

  console.log(scene.width);
  console.log(SCENE_HEIGHT);
  console.log(SCREEN_MID_X);
  console.log(renderer.width);
  console.log(SCREEN_MID_Y);
  console.log(renderer.height);

  const updateCamera = (center: Point, fovRange: number) => {
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
  };

  const generateFieldOfView = (viewPoint, fovRange, shouldLos) => {
    let mid = {};

    const rendererPositionFar = scene.toLocal({
      x: renderer.width,
      y: renderer.height,
    });

    const rendererPositionNear = scene.toLocal({
      x: 0,
      y: 0,
    });

    mid = adjustCenterToViewport(
      {
        totalWidth: SCENE_WIDTH,
        totalHeight: SCENE_HEIGHT,
        viewWidth: renderer.width,
        viewHeight: renderer.height,
        farPos: rendererPositionFar,
        nearPos: rendererPositionNear,
      },
      viewPoint,
    );

    const obstacles = shouldLos ? scene.visible.children : [];

    return calculateFieldOfView(
      new PIXI.Circle(viewPoint.x, viewPoint.y, fovRange + 40),
      PIXI.Graphics,
      viewPoint,
      obstacles,
      fovRange,
      mid,
      scene.visible,
    );
  };

  const generateMask = (center, radius) => {
    const rendererPositionFar = scene.toLocal({
      x: renderer.width,
      y: renderer.height,
    });

    const rendererPositionNear = scene.toLocal({
      x: 0,
      y: 0,
    });

    const mid = adjustCoordToViewPort(
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
    return new PIXI.Graphics()
      .lineStyle(2, 0)
      .beginFill(0xffffff, 1)
      .drawCircle(mid.x, mid.y, radius);
  };

  return {
    updateCamera,
    generateFieldOfView,
    generateMask,
  };
};

export default createCamera;
