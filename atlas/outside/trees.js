const fs = require('fs');

const atlas = {
  meta: {
    image: 'trees.png',
    size: { w: 512, h: 512 },
    scale: '1',
  },
  frames: {},
  animations: {},
};

const largeTreeFrame = {
  rotated: false,
  trimmed: false,
  spriteSourceSize: { x: 0, y: 0, w: 512, h: 512 },
  sourceSize: { w: 512, h: 512 },
  anchor: { x: 0.5, y: 0.8 },
  frame: {
    x: 0,
    y: 240,
    w: 96,
    h: 128,
  },
};

for (let y = 0; y < 2; y++) {
  for (let x = 0; x < 5; x++) {
    let sprite = largeTreeFrame;
    sprite.frame.x = frame.w * x;
    sprite.frame.y = frame.y * y;
    const type = y === 0 ? 'green' : 'red';
    atlas.frames[`large_tree_${type}${x}`];
  }
}

const logFrame = {
  rotated: false,
  trimmed: false,
  spriteSourceSize: { x: 0, y: 0, w: 512, h: 512 },
  sourceSize: { w: 512, h: 512 },
  anchor: { x: 0.5, y: 0.5 },
  frame: {
    x: 256,
    y: 0,
    w: 32,
    h: 32,
  },
};

for (let x = 0; x < 7; x++) {
  let sprite = logFrame;
  sprite.frame.x = frame.w * x;
  sprite.frame.y = frame.y * y;
  atlas.frames[`log_${x}`];
}

fs.writeFile(
  './public/static/assets/outside/trees.json',
  JSON.stringify(atlas),
  function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
  },
);
