const randomTrees = generateRNGTrees({
  startX: this.sceneWidth / 2,
  startY: 0,
  w: this.sceneWidth / 2,
  h: this.sceneHeight,
  mapWidth: this.sceneWidth,
  mapHeight: this.sceneHeight,
  size: 25,
  chanceToStartAsOpen: 0.2,
}).map((pos) => {
  const sprite = Math.random() > 0.7 ? 'tree' : 'pine_tree';
  return new StaticObject({
    spritesheet: 'outside',
    spriteKey: sprite,
    position: pos,
    width: 64,
    height: 64,
  });
});

const randomTrees2 = generateRNGTrees({
  startX: 0,
  startY: this.sceneHeight / 2,
  w: this.sceneWidth,
  h: this.sceneHeight / 2,
  mapWidth: this.sceneWidth,
  mapHeight: this.sceneHeight,
  size: 25,
  chanceToStartAsOpen: 0.2,
}).map((pos) => {
  const sprite = Math.random() > 0.7 ? 'tree' : 'pine_tree';
  return new StaticObject({
    spritesheet: 'outside',
    spriteKey: sprite,
    position: pos,
    width: 64,
    height: 64,
  });
});

const universalTrees = props.trees.map((pos) => {
  const sprite = Math.random() > 0.7 ? 'tree' : 'pine_tree';
  return new StaticObject({
    spritesheet: 'outside',
    spriteKey: sprite,
    position: pos,
    width: 64,
    height: 64,
  });
});
