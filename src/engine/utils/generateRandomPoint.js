export const generateRandomPoint = (input: input) => {
  const { minX, maxX, minY, maxY, sizeX, sizeY } = input;
  let x = minX + Math.random() * (maxX - minX);
  let y = minY + Math.random() * (maxY - minY);
  let emergencyExit = 0;
  while (x + sizeX > maxX || x - sizeX < minX) {
    x = minX + Math.random() * (maxX - minX);
    emergencyExit++;
    if (emergencyExit > 100000) {
      console.error('Stuck in while loop. exiting!');
      return { x, y };
    }
  }
  emergencyExit = 0;
  while (y + sizeY > maxY || y - sizeY < minY) {
    y = minY + Math.random() * (maxY - minY);
    emergencyExit++;
    if (emergencyExit > 100000) {
      console.error('Stuck in while loop. exiting!');
      return { x, y };
    }
  }

  return { x, y };
};

export const generateFreePosition = (
  obstacles: Array<PIXI.Container>,
  circle,
  rect,
  size,
  maxTries = 1000,
) => {
  const generatePos = () => {
    let x, y;
    if (circle) {
      x = circle.x - circle.r + Math.random(circle.r * 2);
      y = circle.y - circle.r + Math.random(circle.r * 2);
    } else {
      x = rect.x + Math.random(rect.width);
      y = rect.y + Math.random(rect.height);
    }
    return { x, y };
  };

  let tries;
  let blocked = obstacles.length > 0;
  let x, y;
  while (blocked) {
    const pos = generatePos();
    x = pos.x;
    y = pos.y;
    if (tries > maxTries) {
      console.log('I dont wanna get stuck, bailing.');
      break;
    }
    for (let i = 0; i < obstacles.length; i++) {
      tries++;
      const area = new PIXI.Circle(x, y, size);
      if (area.contains(obstacles[i].position)) {
        console.log('does this run?');
        break;
      } else if (i === obstacles.length - 1) {
        blocked = false;
      }
    }
  }
  return { x, y };
};
