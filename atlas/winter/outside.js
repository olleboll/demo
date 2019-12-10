const fs = require('fs');

const atlas = {
  meta: {
    image: 'winter_outside.png',
    size: { w: 256, h: 256 },
    scale: '1',
  },
  frames: {},
  animations: {},
};

let med_tree = {
  rotated: false,
  trimmed: false,
  spriteSourceSize: { x: 0, y: 0, w: 256, h: 256 },
  sourceSize: { w: 256, h: 256 },
  anchor: { x: 0.5, y: 0.8 },
  frame: {
    x: 48,
    y: 100,
    w: 48,
    h: 54,
  },
};
atlas.frames['w_med_tree'] = med_tree;

let pine_tree = {
  rotated: false,
  trimmed: false,
  spriteSourceSize: { x: 0, y: 0, w: 256, h: 256 },
  sourceSize: { w: 256, h: 256 },
  anchor: { x: 0.5, y: 0.8 },
  frame: {
    x: 48,
    y: 154,
    w: 48,
    h: 54,
  },
};
atlas.frames['w_pine_tree'] = pine_tree;

console.log(atlas);
console.log(atlas.frames);
fs.writeFile(
  './public/static/assets/objects/winter/winter_outside.json',
  JSON.stringify(atlas),
  function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
  },
);
