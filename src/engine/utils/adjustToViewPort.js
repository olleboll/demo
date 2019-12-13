export const adjustCenterToViewport = (viewport: Viewport, pos: Point) => {
  const {
    totalWidth,
    totalHeight,
    viewWidth,
    viewHeight,
    farPos,
    nearPos,
  } = viewport;
  const coords = {};
  if (Math.abs(pos.x) < totalWidth / 2 - viewWidth / 2) {
    coords.x = viewWidth / 2;
  } else if (pos.x > 0) {
    let diff = pos.x - (totalWidth / 2 - viewWidth / 2);
    coords.x = viewWidth / 2 + diff;
  } else {
    let diff = Math.abs(pos.x) - (totalWidth / 2 - viewWidth / 2);
    coords.x = viewWidth / 2 - diff;
  }
  if (Math.abs(pos.y) < totalHeight / 2 - viewHeight / 2) {
    coords.y = viewHeight / 2;
  } else if (pos.y > 0) {
    let diff = pos.y - (totalHeight / 2 - viewHeight / 2);
    coords.y = viewHeight / 2 + diff;
  } else {
    let diff = Math.abs(pos.y) - (totalHeight / 2 - viewHeight / 2);
    coords.y = viewHeight / 2 - diff;
  }
  return coords;
};

export const adjustCoordToViewPort = (viewport: Viewport, pos: Point) => {
  const {
    totalWidth,
    totalHeight,
    viewWidth,
    viewHeight,
    farPos,
    nearPos,
  } = viewport;
  const coords = {};
  if (pos.x > nearPos.x && pos.x < farPos.x) {
    let diff = pos.x - nearPos.x;
    coords.x = diff;
  } else if (pos.x > farPos.x) {
    let diff = pos.x - farPos.x;
    coords.x = viewWidth + diff;
  } else {
    let diff = nearPos.x - pos.x;
    coords.x = pos.x - diff;
  }

  if (pos.y > nearPos.y && pos.y < farPos.y) {
    let diff = pos.y - nearPos.y;
    coords.y = diff;
  } else if (pos.y > farPos.y) {
    let diff = pos.y - farPos.y;
    coords.y = viewHeight + diff;
  } else {
    let diff = pos.y - nearPos.y;
    coords.y = pos.y + diff;
  }
  return coords;
};
