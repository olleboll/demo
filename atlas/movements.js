const fs = require('fs');

const atlas = {
  meta: {
    image: 'movements.png',
    size: { w: 624, h: 288 },
    scale: '1',
  },
  frames: {},
  animations: {},
};

let width = 26;
let height = 36;

for (let y = 0; y < 2; y++) {
  for (let x = 0; x < 8; x++) {
    for (let j = 0; j < 4; j++) {
      atlas.animations[`move_${y}_${x}_${j}`] = [];
      for (let i = 0; i < 3; i++) {
        let frame = {
          frame: {
            x: width * (x * 3 + i),
            y: height * (y * 4 + j),
            w: width,
            h: height,
          },
          rotated: false,
          trimmed: false,
          spriteSourceSize: { x: 0, y: 0, w: 624, h: 288 },
          sourceSize: { w: 624, h: 288 },
          anchor: { x: 0.5, y: 0.5 },
        };

        atlas.animations[`move_${y}_${x}_${j}`].push(`move_${y}_${x}_${j}${i}`);

        atlas.frames[`move_${y}_${x}_${j}${i}`] = frame;
      }
    }
  }
}

console.log(atlas.frames);
console.log(Object.keys(atlas.frames).length);
console.log(Object.keys(atlas.animations).length);

fs.writeFile(
  './public/static/assets/characters/movements.json',
  JSON.stringify(atlas),
  function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
  },
);
