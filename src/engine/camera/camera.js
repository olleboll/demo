import PIXI from 'engine';

import {
  calculateFieldOfView,
  adjustCenterToViewport,
  adjustCoordToViewPort,
} from 'engine/utils';

class Camera {
  constructor({ renderer, scene }) {
    this.SCENE_WIDTH = scene.width;
    this.SCENE_HEIGHT = scene.height;
    this.SCREEN_MID_X = renderer.width / 2;
    this.SCREEN_MID_Y = renderer.height / 2;
    this.scene = scene;
    this.renderer = renderer;
    scene.position.x = this.SCREEN_MID_X;
    scene.position.y = this.SCREEN_MID_Y;

    this.updateCamera = this.updateCamera.bind(this);
    this.generateFieldOfView = this.generateFieldOfView.bind(this);
    this.generateMask = this.generateMask.bind(this);
  }

  updateCamera(center: Point, fovRange: number) {
    const {
      scene,
      SCENE_WIDTH,
      SCENE_HEIGHT,
      SCREEN_MID_X,
      SCREEN_MID_Y,
    } = this;
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
  }

  generateFieldOfView(viewPoint, fovRange, shouldLos) {
    const { scene, renderer, SCENE_WIDTH, SCENE_HEIGHT } = this;
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
  }

  generateMask(center, radius) {
    const { scene, renderer, SCENE_WIDTH, SCENE_HEIGHT } = this;
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
  }
}

export default Camera;
