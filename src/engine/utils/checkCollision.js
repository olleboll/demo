import { getLinesOfRect } from './getLinesOfRect';

import { contains } from './intersections';

export const checkCollision = (entity: Entity, point: Point) => {
  if (!entity || !entity.getCollisionBox) return false;
  const bounds = entity.getCollisionBox();

  if (bounds.contains(point.x, point.y)) {
    return entity;
  }
  return null;
};

export const checkCollision2 = (entity: Entity, point: Point) => {
  if (!entity || !entity.getCollisionBox) return false;
  const bounds = entity.getCollisionBox();
  const { points } = getLinesOfRect(bounds);
  if (contains(points, { x: point.x, y: point.y })) {
    return entity;
  }
  return null;
};
