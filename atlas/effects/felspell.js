const fs = require('fs');

const createAtlas = (source) => {
  const atlas = {
    meta: {
      image: `felspell.png`,
      size: { w: 1000, h: 1000 },
      scale: '1',
    },
    frames: {},
    animations: {},
  };

  let width = 100;
  let height = 100;
  atlas.animations[`felspell`] = [];
  for (let j = 0; j < 10; j++) {
    for (let i = 0; i < 10; i++) {
      let frame = {
        frame: {
          x: width * i,
          y: height * j,
          w: width,
          h: height,
        },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 1000, h: 1000 },
        sourceSize: { w: 1000, h: 1000 },
        anchor: { x: 0.5, y: 0.5 },
      };
      if (j === 9 && i === 1) break;

      atlas.frames[`felspell_${j * 9 + i}`] = frame;
      atlas.animations[`felspell`].push(`felspell_${j * 9 + i}`);
    }
  }

  fs.writeFile(
    './public/static/assets/effects/felspell/felspell.json',
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
