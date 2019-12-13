export const calculateDistance = (
  s1: Point,
  s2: Point,
): { dx: number, dy: number, distance: number } => {
  let dx = s2.x - s1.x;
  let dy = s2.y - s1.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  return { dx, dy, distance };
};
