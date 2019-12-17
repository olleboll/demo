export const fadeOut = (delta, entity, options, onDone) => {
  // This is run as an update funcitons
  const { endAlpha = 0, fadeSpeed } = options;
  if (entity.alpha <= endAlpha) {
    onDone(delta);
  } else {
    entity.alpha -= fadeSpeed * delta;
  }
};

export const fadeIn = (delta, entity, options, onDone) => {
  // This is run as an update funcitons
  const { endAlpha = 1, fadeSpeed } = options;

  if (entity.alpha >= endAlpha) {
    entity.alpha = endAlpha;
    onDone(delta);
  } else {
    entity.alpha += fadeSpeed * delta;
  }
};
