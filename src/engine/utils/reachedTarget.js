import { calculateDistance } from './calculateDistance';

// reached target functions are broken :(
export const reachedTarget2 = ({ position, target, offset }) => {
  const { dx, dy, distance } = calculateDistance(position, target);
  return Math.abs(dx) < offset.x && Math.abs(dy) < offset.y;
};

export const reachedTarget = ({ position, target, offset }) => {
  const { x: px, y: py } = position;
  const { x: tx, y: ty } = target;
  const { x: offsetX, y: offsetY } = offset;
  return (
    px > tx - Math.abs(offsetX) &&
    px < tx + Math.abs(offsetX) &&
    py > ty - Math.abs(offsetY) &&
    py < ty + Math.abs(offsetY)
  );
};
