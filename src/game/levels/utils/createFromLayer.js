export const createFromLayer = (
  resource,
  layernName,
  sceneWidth,
  sceneHeight,
  creatorFunc,
  spread = true,
) => {
  const { data } = resource.layers.find((l) => l.name === layernName);
  if (!data) {
    console.warn(`couldn't find resource: ${layernName}`);
    return;
  }

  const result = data
    .reduce((current, data, i) => {
      if (data !== 0) {
        const spreadX = spread ? Math.random() * 5 : 0;
        const spreadY = spread ? Math.random() * 5 : 0;
        const last = current[current.length - 1];
        const x = -sceneWidth / 2 + ((i * 16) % sceneWidth) + spreadX;
        const y = -sceneHeight / 2 + Math.floor(i / 200) * 16 + spreadY;
        current.push({ x, y, i });
      }
      return current;
    }, [])
    .map(creatorFunc);
  return result;
};
