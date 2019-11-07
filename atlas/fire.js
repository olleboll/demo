const fs = require('fs');

const atlas = {
  meta: {
    image: 'fire.png',
    size: { w: 320, h: 384 },
    scale: '1',
  },
  frames: {},
  animations: {},
};

let width = 64;
let height = 64;

for (let j = 0; j < 6; j++) {
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
      spriteSourceSize: { x: 0, y: 0, w: 320, h: 384 },
      sourceSize: { w: 320, h: 384 },
      anchor: { x: 0.5, y: 0.5 },
    };
    atlas.frames[`fire_${j * 5 + i}`] = frame;
  }
}

atlas.animations['fire_place'] = ['fire_0', 'fire_1', 'fire_2', 'fire_3'];

atlas.animations['fire_ball'] = [
  'fire_4',
  'fire_5',
  'fire_6',
  'fire_7',
  'fire_8',
  'fire_9',
];

atlas.animations['fire_torch'] = [
  'fire_10',
  'fire_11',
  'fire_12',
  'fire_13',
  'fire_14',
  'fire_15',
];

atlas.animations['fire_pillar'] = [
  'fire_16',
  'fire_17',
  'fire_18',
  'fire_19',
  'fire_20',
  'fire_21',
  'fire_22',
  'fire_23',
  'fire_24',
  'fire_25',
  'fire_26',
];

fs.writeFile(
  './public/static/assets/objects/fire.json',
  JSON.stringify(atlas),
  function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
  },
);
