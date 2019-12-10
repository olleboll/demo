import { generateRNGTrees, generateRandomEnemies } from './levels/utils';

class Medallion {
  constructor(levels, startingLevel, player, stage) {
    this.stage = stage;
    this.levels = levels;
    this.currentLevel = this.levels[startingLevel];
    this.levelsOrder = Object.keys(levels);
    this.levelIndex = this.levelsOrder.findIndex((l) => l === startingLevel);
    this.player = player;
    this.swappingUniverse = false;
    this.currentLevel.addChild(this.player.container);
    this.update = this.update.bind(this);
    this.swapUniverse = this.swapUniverse.bind(this);
    this.stage.addChild(this.currentLevel.scene);
  }

  update(delta) {
    if (!this.player) return;
    const { currentLevel, player } = this;
    if (this.swappingUniverse) {
      this.universeSwapAnimation.update();
      return;
    }
    const obstacles = currentLevel.getObstacles(player.position, 150);
    //const obstacles = currentLevel.visible.children;
    player.update(delta, obstacles, currentLevel.sceneSize);
    currentLevel.update(delta, player);
  }

  swapUniverse(newWorld, onDone) {
    if (this.swappingUniverse) {
      return;
    }
    this.levelIndex =
      this.levelIndex + 1 < this.levelsOrder.length ? this.levelIndex + 1 : 0;
    newWorld = this.levelsOrder[this.levelIndex];
    //newWorld = this.currentLevel.name === 'forest' ? 'winter' : 'forest';
    this.swappingUniverse = true;

    const onComplete = () => {
      this.swappingUniverse = false;
    };

    const onSwap = (delta) => {
      this.currentLevel.visible.removeChild(this.player.container);
      this.stage.removeChild(this.currentLevel.scene);
      this.currentLevel = this.levels[newWorld];

      this.currentLevel.camera.updateCamera(this.player.position, 30);
      this.currentLevel.updateFov(this.player);
      this.player.update(delta, [], this.currentLevel.sceneSize);
      this.currentLevel.visible.addChild(this.player.container);
      this.stage.addChild(this.currentLevel.scene);
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
