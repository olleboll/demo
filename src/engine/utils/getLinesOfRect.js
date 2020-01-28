export const getLinesOfRect = ({ x, y, width, height }) => {
  let p1 = {
    x: x,
    y: y,
  };
  let p2 = {
    x: x + width,
    y: y,
  };
  let p3 = {
    x: x + width,
    y: y + height,
  };
  let p4 = {
    x: x,
    y: y + height,
  };

  return {
    lines: [
      { p1, p2 },
      { p1: p2, p2: p3 },
      { p1: p3, p2: p4 },
      { p1: p4, p2: p1 },
    ],
    points: { p1, p2, p3, p4 },
  };
};
