import PIXI, { getResource } from 'engine';

const createEffect = ({
  spriteSrc,
  spriteKey,
  position,
  scale = 1,
  repeat = false,
  onDone,
}) => {
  const container = new PIXI.Container();
  const { animations } = getResource(spriteSrc, 'spritesheet');
  const animationSprite = new PIXI.AnimatedSprite(animations[spriteKey]);
  animationSprite.zIndex = position.y;
  animationSprite.scale.x = scale;
  animationSprite.scale.y = scale;
  animationSprite.animationSpeed = 1;
  animationSprite.anchor.set(0.5, 0.7);
  animationSprite.loop = repeat;
  animationSprite.visible = true;
  animationSprite.play();

  container.addChild(animationSprite);

  container.position.x = position.x;
  container.position.y = position.y;
  container.zIndex = position.y;

  const destroy = () => {
    container.destroy({ children: true });
  };

  animationSprite.onComplete = () => {
    destroy();
  };

  return {
    container,
    destroy,
  };
};
export { createEffect };
