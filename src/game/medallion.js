import PIXI from 'engine';

import { fadeOut, fadeIn } from 'engine/animations/fade';

import { generateRNGTrees, generateRandomEnemies } from './levels/utils';

import CarryObject from 'game/objects/carry';

class Medallion {
  constructor(levels, startingLevel, player, stage, gui, renderer) {
    this.stage = stage;
    this.renderer = renderer;
    this.gui = gui;
    this.levels = levels;
    this.currentLevel = this.levels[startingLevel];
    this.levelsOrder = Object.keys(levels);
    this.levelIndex = this.levelsOrder.findIndex((l) => l === startingLevel);
    this.player = player;
    this.swappingUniverse = false;
    this.currentLevel.addChild(this.player);
    this.universal = [];

    // const boulder = new CarryObject({
    //   spritesheet: 'outside',
    //   spriteKey: 'pink_tree',
    //   position: { x: player.position.x + 30, y: player.position.y },
    //   width: 64,
    //   height: 64,
    //   los: false,
    // });
    // this.currentLevel.addChild(boulder, boulder.fogOfWarContainer);
    // this.universal = [boulder];
    this.interacting = false;
    this.interactingObject = null;
    this.stage.addChild(this.currentLevel.scene);
    this.stage.addChild(this.gui);

    this.gui.width = renderer.width;
    this.gui.height = renderer.height;

    this.update = this.update.bind(this);
    this.defaultUpdate = this.update;
    this.playerInteract = this.playerInteract.bind(this);
    this.swapUniverse = this.swapUniverse.bind(this);
  }

  update(delta) {
    if (!this.player) return;
    const { currentLevel, player } = this;
    //const obstacles = currentLevel.getObstacles(player.position, 150);
    const obstacles = currentLevel.visible.children;
    player.update(delta, obstacles, currentLevel);
    currentLevel.update(delta, player);
    if (this.interactingObject) {
      this.interactingObject.update(delta, this);
    }
  }

  playerInteract(active) {
    // create a set with all interactive objects in this level. including universal
    const local = this.currentLevel.interactiveObjects;
    if (this.interactingObject && active) {
      return;
    } else if (active) {
      // started interacting
      const setOfObjects = new Set(this.universal.concat(local));
      const arr = [...setOfObjects];
      console.log(arr);
      const aoe = new PIXI.Circle(
        this.player.position.x,
        this.player.position.y,
        40,
      );
      for (let o of arr) {
        const { x, y } = o.position;
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
    this.currentLevel.onLeave();

    const onComplete = () => {
      this.currentLevel.onEnter();
      this.swappingUniverse = false;
      this.update = this.defaultUpdate.bind(this);
      this.player.resumeDash();
    };

    const onSwap = (delta) => {
      this.currentLevel.visible.removeChild(this.player);
      const index = this.stage.getChildIndex(this.currentLevel.scene);
      this.stage.removeChild(this.currentLevel.scene);
      this.currentLevel = this.levels[newWorld];
      this.universal.forEach((obj) => this.currentLevel.addChild(obj));
      this.currentLevel.visible.addChild(this.player);
      this.stage.addChildAt(this.currentLevel.scene, index);
      // this.currentLevel.camera.updateCamera(this.player.position, 30);
      // this.currentLevel.updateFov(this.player);
      this.currentLevel.update(delta, this.player);

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
    this.player.pausDash();
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
