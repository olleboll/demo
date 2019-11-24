import PIXI, { getResource } from 'engine';

const createFire = ({ position, radius }) => {
  const container = new PIXI.Container();
  const { animations } = getResource('fire', 'spritesheet');
  const animationSprite = new PIXI.AnimatedSprite(animations['fire_place']);
  const originalRadius = radius;
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
    if (counter % 4 === 0) {
      radius = radius - 2 + Math.random() * 4;
      if (radius > originalRadius + 3) {
        radius = originalRadius + 3;
      } else if (radius < originalRadius - 3) {
        radius = originalRadius - 3;
      }
    }
    counter++;
    if (counter > 400) {
      counter = 0;
    }
    return radius;
  };
  return {
    id: Math.random(),
    container,
    radius,
    getNewRadius,
  };
};

export default createFire;
