const fs = require('fs');

const atlas = {
  meta: {
    image: 'outside.png',
    size: { w: 832, h: 384 },
    scale: '1',
  },
  frames: {},
  animations: {},
};

let med_tree = {
  rotated: false,
  trimmed: false,
  spriteSourceSize: { x: 0, y: 0, w: 832, h: 384 },
  sourceSize: { w: 832, h: 384 },
  anchor: { x: 0.5, y: 0.8 },
  frame: {
    x: 270,
    y: 48,
    w: 64,
    h: 64,
  },
};
atlas.frames['med_tree'] = med_tree;

let pine_tree = {
  rotated: false,
  trimmed: false,
  spriteSourceSize: { x: 0, y: 0, w: 832, h: 384 },
  sourceSize: { w: 832, h: 384 },
  anchor: { x: 0.5, y: 0.8 },
  frame: {
    x: 402,
    y: 48,
    w: 45,
    h: 64,
  },
};
atlas.frames['pine_tree'] = pine_tree;

console.log(atlas);
console.log(atlas.frames);
fs.writeFile(
  './public/static/assets/objects/outside.json',
  JSON.stringify(atlas),
  function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
  },
);
