class Medallion {
  constructor(levels, startingLevel, player) {
    this.levels = levels;
    this.currentLevel = this.levels[startingLevel];
    this.player = player;
    this.swappingUniverse = false;
    this.currentLevel.addChild(this.player.container);
    this.update = this.update.bind(this);
    //this.swapUniverse = this.swapUniverse.bind(this);
  }

  update(delta) {
    if (!this.player) return;
    const { currentLevel, player } = this;
    const obstacles = currentLevel.getObstacles(player.position, 40);
    //const obstacles = currentLevel.visible.children
    player.update(delta, obstacles, currentLevel.sceneSize);
    currentLevel.update(delta, player);
  }

  // swapUniverse(onDone) {
  //   this.swappingUniverse = true;
  //
  //   const onComplete = () => {
  //     this.swappingUniverse = false;
  //     onDone();
  //   };
  //
  //   const onSwap = () => {
  //     console.log('yep, swapping');
  //     const cameraPosition = this.activeUniverse.map.position;
  //     const cameraPivot = this.activeUniverse.map.pivot;
  //     this.activeUniverse.visible.removeChild(this.player.container);
  //     this.stage.removeChild(this.activeUniverse.stage);
  //
  //     this.activeUniverse.map.position.x = cameraPosition.x;
  //     this.activeUniverse.map.position.y = cameraPosition.y;
  //     this.activeUniverse.map.pivot.x = cameraPivot.x;
  //     this.activeUniverse.map.pivot.y = cameraPivot.y;
  //
  //     this.activeUniverse.visible.addChild(this.player.container);
  //     this.stage.addChild(this.activeUniverse.stage);
  //     this.activeUniverse.updateCamera(this.player.position);
  //     this.activeUniverse.setPlayer(this.player);
  //   };
  //   let next, old;
  //   if (this.activeUniverse instanceof Forest) {
  //     old = this.forest.map;
  //     next = this.city.map;
  //   } else {
  //     next = this.forest.map;
  //     old = this.city.map;
  //   }
  //
  //   this.universeSwapAnimation = universeSwap({
  //     fromWorld: old,
  //     toWorld: next,
  //     onSwap: onSwap.bind(this),
  //     onComplete: onComplete.bind(this),
  //   });
  // }
}

const universeSwap = ({ fromWorld, toWorld, onSwap, onComplete }) => {
  const fromAlpha = fromWorld.alpha;
  const toAlpha = toWorld.alpha;

  toWorld.alpha = 0;

  let fadeIn = false;
  let fadeOut = true;

  const update = (delta) => {
    if (fadeOut) {
      fromWorld.alpha -= 0.02;
    }

    if (fadeIn) {
      if (toWorld.alpha >= toAlpha) {
        onComplete();
        return;
      }
      toWorld.alpha += 0.02;
    }
    if (fromWorld.alpha < 0 && fadeOut) {
      onSwap();
      fadeOut = false;
      fadeIn = true;
      fromWorld.alpha = fromAlpha;
    }
  };
  return {
    update,
  };
};

export default Medallion;
