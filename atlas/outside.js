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

let sign_small = {
  rotated: false,
  trimmed: false,
  spriteSourceSize: { x: 0, y: 0, w: 832, h: 384 },
  sourceSize: { w: 832, h: 384 },
  anchor: { x: 0.5, y: 0.5 },
  frame: {
    x: 16,
    y: 16,
    w: 16,
    h: 16,
  },
};
atlas.frames['sign_small'] = sign_small;

let sign_big = {
  rotated: false,
  trimmed: false,
  spriteSourceSize: { x: 0, y: 0, w: 832, h: 384 },
  sourceSize: { w: 832, h: 384 },
  anchor: { x: 0.5, y: 0.5 },
  frame: {
    x: 48,
    y: 24,
    w: 32,
    h: 32,
  },
};
atlas.frames['sign_big'] = sign_big;

let tree = {
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
atlas.frames['tree'] = tree;

let med_tree = {
  rotated: false,
  trimmed: false,
  spriteSourceSize: { x: 0, y: 0, w: 832, h: 384 },
  sourceSize: { w: 832, h: 384 },
  anchor: { x: 0.5, y: 0.8 },
  frame: {
    x: 388,
    y: 112,
    w: 48,
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

let dead_tree = {
  rotated: false,
  trimmed: false,
  spriteSourceSize: { x: 0, y: 0, w: 832, h: 384 },
  sourceSize: { w: 832, h: 384 },
  anchor: { x: 0.5, y: 0.8 },
  frame: {
    x: 496,
    y: 52,
    w: 32,
    h: 64,
  },
};
atlas.frames['dead_tree'] = dead_tree;

let fall_tree = {
  rotated: false,
  trimmed: false,
  spriteSourceSize: { x: 0, y: 0, w: 832, h: 384 },
  sourceSize: { w: 832, h: 384 },
  anchor: { x: 0.5, y: 0.8 },
  frame: {
    x: 484,
    y: 112,
    w: 42,
    h: 64,
  },
};
atlas.frames['fall_tree'] = fall_tree;

let pink_tree = {
  rotated: false,
  trimmed: false,
  spriteSourceSize: { x: 0, y: 0, w: 832, h: 384 },
  sourceSize: { w: 832, h: 384 },
  anchor: { x: 0.5, y: 0.8 },
  frame: {
    x: 460,
    y: 178,
    w: 52,
    h: 64,
  },
};
atlas.frames['pink_tree'] = pink_tree;

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
