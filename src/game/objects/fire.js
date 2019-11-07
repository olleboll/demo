import PIXI, { getResource } from 'engine';

const createFire = ({ position, radius }) => {
  const container = new PIXI.Container();
  const { animations } = getResource('fire', 'spritesheet');
  const animationSprite = new PIXI.AnimatedSprite(animations['fire_place']);

  animationSprite.zIndex = position.y;
  animationSprite.animationSpeed = 0.1;
  animationSprite.loop = true;
  animationSprite.visible = true;
  animationSprite.play();

  container.addChild(animationSprite);

  container.position.x = position.x;
  container.position.y = position.y;
  let counter = 0;
  const getNewRadius = () => {
    let newRadius = radius;
    if (counter % 4 === 0) {
      newRadius = radius - 5 + Math.random() * 5;
    }
    counter++;
    return newRadius;
  };
  return {
    id: Math.random(),
    container,
    radius,
    getNewRadius,
  };
};

export default createFire;
