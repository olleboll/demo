const fs = require('fs');

const atlas = {
  meta: {
    image: 'icons.png',
    size: { w: 512, h: 672 },
    scale: '1',
  },
  frames: {},
  animations: {},
};

let width = 32;
let height = 32;

for (let j = 0; j < 21; j++) {
  for (let i = 0; i < 16; i++) {
    let frame = {
      frame: {
        x: width * i,
        y: height * j,
        w: width,
        h: height,
      },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 512, h: 672 },
      sourceSize: { w: 512, h: 672 },
      anchor: { x: 0.5, y: 0.5 },
    };
    atlas.frames[`icon_${j * 16 + i}`] = frame;
  }
}

fs.writeFile(
  './public/static/assets/objects/icons.json',
  JSON.stringify(atlas),
  function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
  },
);
