const fs = require('fs');

const atlas = {
  meta: {
    image: 'weapons_1.png',
    size: { w: 320, h: 448 },
    scale: '1',
  },
  frames: {},
  animations: {},
};

let width = 64;
let height = 64;

for (let j = 0; j < 7; j++) {
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
      spriteSourceSize: { x: 0, y: 0, w: 320, h: 448 },
      sourceSize: { w: 320, h: 448 },
      anchor: { x: 0.5, y: 0.5 },
    };
    atlas.frames[`sword_${j * 5 + i}`] = frame;
  }
}

atlas.animations['sword_swing_1'] = [
  'sword_0',
  'sword_1',
  'sword_2',
  'sword_3',
  'sword_4',
  'sword_5',
  'sword_6',
  'sword_7',
  'sword_8',
  'sword_9',
];

atlas.animations['sword_swing_2'] = [
  'sword_10',
  'sword_11',
  'sword_12',
  'sword_13',
  'sword_14',
  'sword_15',
  'sword_16',
  'sword_17',
];

atlas.animations['sword_swing_3'] = [];
for (let i = 27; i < 35; i++) {
  atlas.animations['sword_swing_3'].push(`sword_${i}`);
}

atlas.animations['sword_swing_4'] = [
  'sword_24',
  'sword_25',
  'sword_26',
  'sword_30',
  'sword_31',
];

fs.writeFile(
  './public/static/assets/weapons/weapons_1.json',
  JSON.stringify(atlas),
  function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
  },
);
