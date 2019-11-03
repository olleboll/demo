let newMaskC = adjustCordToViewPort(
  {
    totalWidth: SCENE_WIDTH,
    totalHeight: SCENE_HEIGHT,
    viewWidth: renderer.width,
    viewHeight: renderer.height,
    farPos: rendererPositionFar,
    nearPos: rendererPositionNear,
  },
  mask2Pos,
);
