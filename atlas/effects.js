const fs = require('fs');

const createAtlas = (source) => {
  const atlas = {
    meta: {
      image: `${source}`,
      size: { w: 800, h: 800 },
      scale: '1',
    },
    frames: {},
    animations: {},
  };

  let width = 100;
  let height = 100;
  atlas.animations[`fire`] = [];
  for (let j = 0; j < 8; j++) {
    for (let i = 0; i < 8; i++) {
      let frame = {
        frame: {
          x: width * i,
          y: height * j,
          w: width,
          h: height,
        },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 800, h: 800 },
        sourceSize: { w: 800, h: 800 },
        anchor: { x: 0.5, y: 0.5 },
      };
      if (j === 7 && i === 5) break;

      atlas.frames[`firex_${j * 5 + i}`] = frame;
      atlas.animations[`fire`].push(`firex_${j * 5 + i}`);
    }
  }

  fs.writeFile(
    './public/static/assets/effects/fire/fire2.json',
    JSON.stringify(atlas),
    function(err) {
      if (err) {
        return console.log(err);
      }

      console.log('The file was saved!');
    },
  );
};

createAtlas('11_fire_spritesheet.png');
