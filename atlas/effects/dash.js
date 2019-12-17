const fs = require('fs');

const createAtlas = (source) => {
  const atlas = {
    meta: {
      image: `dash.png`,
      size: { w: 700, h: 700 },
      scale: '1',
    },
    frames: {},
    animations: {},
  };

  let width = 100;
  let height = 100;
  atlas.animations[`dash`] = [];
  for (let j = 0; j < 5; j++) {
    for (let i = 1; i < 6; i++) {
      let frame = {
        frame: {
          x: width * i,
          y: height * j,
          w: width,
          h: height,
        },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 700, h: 700 },
        sourceSize: { w: 700, h: 700 },
        anchor: { x: 0.5, y: 0.8 },
      };
      if (j === 4 && i === 3) break;

      atlas.frames[`dash_${j * 6 + i}`] = frame;
      atlas.animations[`dash`].push(`dash_${j * 6 + i}`);
    }
  }

  fs.writeFile(
    './public/static/assets/effects/dash/dash.json',
    JSON.stringify(atlas),
    function(err) {
      if (err) {
        return console.log(err);
      }

      console.log('The file was saved!');
    },
  );
};

createAtlas();
