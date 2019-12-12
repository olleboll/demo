const fs = require('fs');

const atlas = {
  meta: {
    image: 'animals2.png',
    size: { w: 504, h: 288 },
    scale: '1',
  },
  frames: {},
  animations: {},
};

let width = 42;
let height = 36;

for (let y = 0; y < 2; y++) {
  for (let x = 0; x < 4; x++) {
    for (let j = 0; j < 4; j++) {
      atlas.animations[`animals2_${y}_${x}_${j}`] = [];
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
          spriteSourceSize: { x: 0, y: 0, w: 504, h: 288 },
          sourceSize: { w: 504, h: 288 },
          anchor: { x: 0.5, y: 0.5 },
        };

        atlas.animations[`animals2_${y}_${x}_${j}`].push(
          `animals2_${y}_${x}_${j}${i}`,
        );

        atlas.frames[`animals2_${y}_${x}_${j}${i}`] = frame;
      }
    }
  }
}

console.log(atlas.frames);
console.log(Object.keys(atlas.frames).length);
console.log(Object.keys(atlas.animations).length);

fs.writeFile(
  './public/static/assets/animals/animals2.json',
  JSON.stringify(atlas),
  function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
  },
);
