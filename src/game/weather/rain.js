import PIXI from 'engine';

const createRain = ({
  position,
  width,
  height,
  intensity,
  container,
  brightness,
}) => {
  const drops = [];
  let active = true;
  let thunderCouldActivate = true;
  let thunder = null;
  const particleContainer = new PIXI.ParticleContainer();
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
    let drop = {};
    drop.startX = x;
    drop.startY = y;

    //drop.g = new PIXI.Sprite.from('/static/particles/particle.png')
    drop.g = new PIXI.Sprite(PIXI.Texture.WHITE);
    drop.g.tint = 0xaaaaff; //Change with the color wanted
    drop.g.width = 4;
    drop.g.height = 4;

    drop.g.position.x = x;
    drop.g.position.y = y;
    // drop.g.scale.x = 0.1
    // drop.g.scale.y = 0.1
    drop.dir = 1;
    drop.counterStart = drop.counter;
    drop.maxY = y + parseInt(Math.random() * 75) + 50;
    drop.speed = 7; // TODO: do stuff with intensity?
    drops.push(drop);
    particleContainer.addChild(drop.g);
  }

  particleContainer.zIndex = 1000;
  particleContainer.zIndexForced = true;
  //container.filters = [new PIXI.filters.AlphaFilter(0.3)]
  container.addChild(particleContainer);

  const initThunder = () => {
    clearTimeout(thunder);
    container.filters = [new PIXI.filters.AlphaFilter(1.5)];
    thunder = setTimeout(() => {
      container.filters = [new PIXI.filters.AlphaFilter(brightness)];
      setTimeout(() => {
        container.filters = [new PIXI.filters.AlphaFilter(1.5)];
        setTimeout(() => {
          container.filters = [new PIXI.filters.AlphaFilter(brightness)];
          thunder = null;
        }, Math.random() * 100 + 100);
      }, Math.random() * 100 + 100);
    }, Math.random() * 100 + 100);
  };

  const start = () => {
    active = true;
  };

  const stop = () => {
    active = false;
    thunder = null;
  };

  const contains = ({ x, y }) => {
    return rect.contains(x, y);
  };

  const globalEffect = (active) => {
    thunderCouldActivate = active;
  };

  const animate = (delta) => {
    if (!active) return;
    for (let i = 0; i < drops.length; i++) {
      const drop = drops[i];
      const speed = drop.speed * delta;
      drop.g.position.y += speed * 0.75;
      drop.g.position.x += speed;
      if (drop.g.position.y > drop.maxY) {
        drop.g.position.y = drop.startY;
        drop.g.position.x = drop.startX;
      }
    }

    if (!thunder && thunderCouldActivate) {
      if (Math.random() > 0.995) {
        initThunder();
      }
    }
  };

  return {
    start,
    stop,
    animate,
    contains,
    thunder: initThunder,
    globalEffect,
  };
};

export default createRain;
