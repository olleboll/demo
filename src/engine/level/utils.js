export const generateGrid = (dimensions, squareSize) => {
  console.log(dimensions);
  console.log(squareSize);
  const { width, height } = dimensions;
  const numberOfSquaresX = Math.floor(width / squareSize);
  const numberOfSquaresY = Math.floor(height / squareSize);

  const grid = [];
  for (let i = 0; i < numberOfSquaresX; i++) {
    grid[i] = [];
    for (let j = 0; j < numberOfSquaresY; j++) {
      grid[i][j] = [];
    }
  }
  return grid;
};

export const pointToSquare = (point, grid, mapSize) => {
  // point should be acoordinate where origin is mid of map
  // So we need to translate it
  let xT = point.x + mapSize.width / 2;
  let yT = point.y + mapSize.height / 2;

  if (xT <= 0) {
    xT = 0;
  }
  if (yT <= 0) {
    yT = 0;
  }
  if (xT >= mapSize.width) {
    xT = mapSize.width;
  }
  if (yT >= mapSize.height) {
    yT = mapSize.height;
  }

  const xS = Math.floor((xT / mapSize.width) * (grid.length - 1));
  const yS = Math.floor((yT / mapSize.height) * (grid[0].length - 1));

  return { square: grid[xS][yS], x: xS, y: yS };
};

// rename. This shoiuld return a set of object within the supplied squares
export const includeAdjecentSquares = ({ s1, s2, s3, s4 }, grid) => {
  const allSquares = [];
  Array.prototype.push.apply(
    allSquares,
    s1.square,
    s2.square,
    s3.square,
    s4.square,
  );

  //let allSquares = s1.square.concat(s2.square, s3.square, s4.square);

  const diffX = s2.x - s1.x;
  const diffY = s4.y - s1.y;

  for (let x = 0; x < diffX; x++) {
    for (let y = 0; y < diffY; y++) {
      Array.prototype.push.apply(allSquares, grid[s1.x + x][s1.y + y]);
    }
  }

  return new Set(allSquares);
};
