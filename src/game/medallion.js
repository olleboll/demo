class Medallion {
  constructor(levels, startingLevel, player, stage) {
    this.stage = stage;
    this.levels = levels;
    this.currentLevel = this.levels[startingLevel];
    this.player = player;
    this.swappingUniverse = false;
    this.currentLevel.addChild(this.player.container);
    this.update = this.update.bind(this);
    this.swapUniverse = this.swapUniverse.bind(this);
  }

  update(delta) {
    if (!this.player) return;
    const { currentLevel, player } = this;
    if (this.swappingUniverse) {
      this.universeSwapAnimation.update();
      return;
    }
    const obstacles = currentLevel.getObstacles(player.position, 100);
    //const obstacles = currentLevel.visible.children
    player.update(delta, obstacles, currentLevel.sceneSize);
    currentLevel.update(delta, player);
  }

  swapUniverse(newWorld, onDone) {
    console.log('swapping!?');
    console.log(newWorld);
    newWorld = this.currentLevel.name === 'forest' ? 'city' : 'forest';
    console.log(newWorld);
    console.log(this.currentLevel.name);
    this.swappingUniverse = true;

    const onComplete = () => {
      this.swappingUniverse = false;
      //onDone();
    };

    const onSwap = (delta) => {
      console.log('yep, swapping');
      this.currentLevel.visible.removeChild(this.player.container);
      this.stage.removeChild(this.currentLevel.scene);

      // this.currentLevel.map.position.x = cameraPosition.x;
      // this.currentLevel.map.position.y = cameraPosition.y;
      // this.currentLevel.map.pivot.x = cameraPivot.x;
      // this.currentLevel.map.pivot.y = cameraPivot.y;
      this.currentLevel = this.levels[newWorld];
      this.currentLevel.visible.addChild(this.player.container);
      this.stage.addChild(this.currentLevel.scene);
      this.player.update(delta, [], this.currentLevel.sceneSize);
      this.currentLevel.update(delta, this.player);
    };

    this.universeSwapAnimation = universeSwap({
      fromWorld: this.currentLevel,
      toWorld: this.levels[newWorld],
      onSwap: onSwap.bind(this),
      onComplete: onComplete.bind(this),
    });
  }
}

const universeSwap = ({ fromWorld, toWorld, onSwap, onComplete }) => {
  const fromAlpha = fromWorld.scene.alpha;
  const toAlpha = toWorld.scene.alpha;

  toWorld.scene.alpha = 0;

  let fadeIn = false;
  let fadeOut = true;

  const update = (delta) => {
    if (fadeOut) {
      fromWorld.scene.alpha -= 0.02;
    }

    if (fadeIn) {
      if (toWorld.scene.alpha >= toAlpha) {
        onComplete();
        return;
      }
      toWorld.scene.alpha += 0.02;
    }
    if (fromWorld.scene.alpha < 0 && fadeOut) {
      onSwap(delta);
      fadeOut = false;
      fadeIn = true;
      fromWorld.scene.alpha = fromAlpha;
    }
  };
  return {
    update,
  };
};

export default Medallion;
