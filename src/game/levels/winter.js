import Level from 'engine/level';
import PIXI, { getResource } from 'engine';

import { generateRandomReindeer } from './utils';
import { StaticObject } from 'engine/objects';
import { objects } from 'game/sprites';

import { createSnow } from 'game/weather';

import { generateRNGTrees, generateRandomEnemies } from './utils';

import { createFromLayer } from 'game/levels/utils/createFromLayer';

import { blackBorderFilter } from 'game/shaders/blackBorder';

import resource from './elyn/elyn_big.json';

class WinterLevel extends Level {
  constructor(props) {
    super(props);
    this.name = 'winter';
    this.dealDamage = props.dealDamage;

    const levelTrees = createFromLayer(
      resource,
      'tree_collision',
      this.sceneWidth,
      this.sceneHeight,
      (data, i) => {
        const sprite = Math.random() > 0.7 ? 'w_pine_tree' : 'w_med_tree';
        return new StaticObject({
          spritesheet: 'winter_outside',
          spriteKey: sprite,
          position: data,
          width: 64,
          height: 64,
        });
      },
    );
    const w = 928;
    const h = 1008;
    //const randomTrees = [];
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
      const sprite = Math.random() > 0.7 ? 'w_pine_tree' : 'w_med_tree';
      return new StaticObject({
        spritesheet: 'winter_outside',
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
      const sprite = Math.random() > 0.7 ? 'w_pine_tree' : 'w_med_tree';
      return new StaticObject({
        spritesheet: 'winter_outside',
        spriteKey: sprite,
        position: pos,
        width: 64,
        height: 64,
      });
    });

    const universalTrees = props.trees.map((pos) => {
      const sprite = Math.random() > 0.7 ? 'w_pine_tree' : 'w_med_tree';
      return new StaticObject({
        spritesheet: 'winter_outside',
        spriteKey: sprite,
        position: pos,
        width: 64,
        height: 64,
      });
    });

    this.trees = levelTrees.concat(randomTrees, randomTrees2);

    this.trees.forEach((tree) => {
      this.addChild(tree, tree.fogOfWarContainer);
    });

    // this.trees = props.trees.map((pos) => {
    //   const sprite = Math.random() > 0.7 ? 'w_pine_tree' : 'w_med_tree';
    //   return new StaticObject({
    //     spritesheet: 'winter_outside',
    //     spriteKey: sprite,
    //     position: pos,
    //     width: 64,
    //     height: 64,
    //   });
    // });
    // this.trees.forEach((tree) =>
    //   this.addChild(tree.container, tree.fogOfWarContainer),
    // );

    this.reindeer = [];

    this.reindeer = generateRandomReindeer(30, {
      width: this.sceneSize.width,
      height: this.sceneSize.height,
      level: this,
      dealDamage: this.dealDamage,
      remove: this.removeReindeer,
      speed: 1,
    });

    this.reindeer.forEach((reindeer) => this.addChild(reindeer));

    const snow = createSnow({
      position: { x: -750, y: -750 },
      width: 1400,
      height: 1400,
      intensity: 4,
      container: this.visible,
    });

    this.setEffect(snow);
    this.removeReindeer = this.removeReindeer.bind(this);
    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);

    // test
    // console.log(getResource('winter_camp'));
    // const { winter_camp } = getResource('winter_camp').textures;
    //
    // const camp = new PIXI.Sprite(winter_camp);
    // camp.zIndex = -500;
    // this.addChild(camp);
  }

  update(delta, player) {
    super.update(delta, player);
    this.reindeer.forEach((deer) => {
      deer.update(delta, this.visible.children, this.sceneSize);
    });
  }

  removeReindeer = (entity) => {
    this.reindeer = this.reindeer.filter((e) => e !== entity);
  };

  // onEnter() {
  //   if (!this.ambience) return;
  //   console.log('play');
  //   this.ambienceId = this.ambience.play();
  //   console.log(this.ambienceId);
  //   this.ambience.fade(0, 1, 1000, this.ambienceId);
  //   console.log('done');
  // }
  //
  // onLeave() {
  //   console.log(this);
  //   if (!this.ambience) return;
  //   console.log(this.ambienceId);
  //   this.ambience.pause(this.ambienceId);
  //   console.log('wtf?');
  // }
}

export default WinterLevel;
