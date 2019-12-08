const fs = require('fs');

const atlas = {
  meta: {
    image: 'object.png',
    size: { w: 320, h: 256 },
    scale: '1',
  },
  frames: {},
  animations: {},
};

let width = 64;
let height = 64;

for (let j = 0; j < 4; j++) {
  for (let i = 0; i < 5; i++) {
    let frame = {
      frame: {
        x: width * i,
        y: height * j,
        w: width,
        h: height,
      },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 320, h: 256 },
      sourceSize: { w: 320, h: 256 },
      anchor: { x: 0.5, y: 0.5 },
    };
    atlas.frames[`obj_${j * 5 + i}`] = frame;
  }
}

fs.writeFile(
  './public/static/assets/weapons/bomb_arrow.json',
  JSON.stringify(atlas),
  function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
  },
);
