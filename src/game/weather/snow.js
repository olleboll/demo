import PIXI from 'engine';

const createSnow = ({ position, width, height, intensity, container }) => {
  const flakes = [];
  const particleContainer = new PIXI.Container(); //new new PIXI.particles.ParticleContainer()
  const bounds = {
    x: position.x,
    y: position.y,
    width,
    height,
  };
  const rect = new PIXI.Rectangle(position.x, position.y, width, height);
  particleContainer.position.x = position.x;
  particleContainer.position.y = position.y;
  particleContainer.width = width;
  particleContainer.height = height;
  for (let i = 0; i < intensity * 500; i++) {
    let x = Math.random() * width;
    let y = Math.random() * height;
    let flake = {};
    flake.startX = x;
    flake.startY = y;

    //flake.g = new PIXI.Sprite.from('/static/particles/particle.png')
    flake.container = new PIXI.Container();
    flake.g = new PIXI.Sprite(PIXI.Texture.WHITE);
    flake.g.position.x = 10;
    flake.g.position.y = 10;
    //flake.g.tint = 0xaaaaff; //Change with the color wanted
    flake.g.width = 4;
    flake.g.height = 4;

    flake.container.position.x = x;
    flake.container.position.y = y;
    // flake.g.scale.x = 0.1
    // flake.g.scale.y = 0.1
    flake.dir = 1;
    flake.counterStart = flake.counter;
    flake.maxY = y + parseInt(Math.random() * 75) + 50;
    flake.speed = 0.8; // TODO: do stuff with intensity?
    flakes.push(flake);
    flake.container.addChild(flake.g);
    particleContainer.addChild(flake.container);
  }

  particleContainer.zIndex = 1000;
  particleContainer.zIndexForced = true;
  //container.filters = [new PIXI.filters.AlphaFilter(0.3)]
  container.addChild(particleContainer);

  const animate = (delta) => {
    for (let i = 0; i < flakes.length; i++) {
      const flake = flakes[i];
      const speed = flake.speed * delta;
      flake.container.position.y += speed * 0.75 * delta;
      flake.container.rotation += 0.05 * delta;
      if (flake.container.position.y > flake.maxY) {
        flake.container.position.y = flake.startY;
      }
    }
  };

  return {
    animate,
  };
};

export default createSnow;
