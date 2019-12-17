import PIXI from 'engine';

import { fadeOut, fadeIn } from 'engine/animations/fade';

import { generateRNGTrees, generateRandomEnemies } from './levels/utils';

import Boulder from 'game/objects/boulder';

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
    this.universal = [];

    // const boulder = new Boulder({
    //   spritesheet: 'outside',
    //   spriteKey: 'pink_tree',
    //   position: { x: player.position.x + 30, y: player.position.y },
    //   width: 64,
    //   height: 64,
    // });
    // this.currentLevel.addChild(boulder.container, boulder.fogOfWarContainer);
    // this.universal = [boulder];
    this.interacting = false;
    this.interactingObject = null;
    this.stage.addChild(this.currentLevel.scene);
    this.update = this.update.bind(this);
    this.defaultUpdate = this.update;
    this.playerInteract = this.playerInteract.bind(this);
    this.swapUniverse = this.swapUniverse.bind(this);
  }

  update(delta) {
    if (!this.player) return;
    const { currentLevel, player } = this;
    const obstacles = currentLevel.getObstacles(player.position, 150);
    //const obstacles = currentLevel.visible.children;
    player.update(delta, obstacles, currentLevel.sceneSize);
    currentLevel.update(delta, player);
  }

  playerInteract(active) {
    // create a set with all interactive objects in this level. including universal
    if (this.interacting && active) {
      return;
    } else if (active) {
      // started interacting
      const setOfObjects = new Set(this.universal);
      const arr = [...setOfObjects];
      const aoe = new PIXI.Circle(
        this.player.position.x,
        this.player.position.y,
        40,
      );
      for (let o of arr) {
        const { x, y } = o.container.position;
        if (aoe.contains(x, y)) {
          if (o.interact) {
            o.interact(this);
            this.interactingObject = o;
            break;
          }
        }
      }
    } else if (this.interactingObject && !active) {
      // stopped interacting
      this.interactingObject.stopInteract(this);
      this.interactingObject = null;
    }
  }

  swapUniverse(newWorld, onDone) {
    if (this.swappingUniverse) {
      return;
    }
    this.levelIndex =
      this.levelIndex + 1 < this.levelsOrder.length ? this.levelIndex + 1 : 0;
    newWorld = this.levelsOrder[this.levelIndex];
    this.swappingUniverse = true;

    const onComplete = () => {
      this.swappingUniverse = false;
      this.update = this.defaultUpdate.bind(this);
    };

    const onSwap = (delta) => {
      this.currentLevel.visible.removeChild(this.player.container);
      this.stage.removeChild(this.currentLevel.scene);
      this.currentLevel = this.levels[newWorld];
      this.universal.forEach((obj) => {
        this.currentLevel.addChild(obj.container, obj.fogOfWarContainer);
      });
      this.currentLevel.camera.updateCamera(this.player.position, 30);
      this.currentLevel.updateFov(this.player);
      this.currentLevel.visible.addChild(this.player.container);
      this.stage.addChild(this.currentLevel.scene);

      this.levels[newWorld].scene.alpha = 0;
      this.update = (delta) => {
        fadeIn(
          delta,
          this.levels[newWorld].scene,
          { endAlpha: 1, fadeSpeed: 0.01 },
          onComplete.bind(this),
        );
      };
    };

    this.update = (delta) => {
      fadeOut(
        delta,
        this.currentLevel.scene,
        { endAlpha: 0, fadeSpeed: 0.01 },
        onSwap.bind(this),
      );
    };
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
