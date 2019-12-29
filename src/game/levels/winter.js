import Level from 'engine/level';
import PIXI, { getResource } from 'engine';

import { generateRandomReindeer } from './utils';
import { StaticObject } from 'engine/objects';
import { objects } from 'game/sprites';

import { createSnow } from 'game/weather';

class WinterLevel extends Level {
  constructor(props) {
    super(props);
    this.name = 'winter';
    this.dealDamage = props.dealDamage;
    this.trees = props.trees.map((pos) => {
      const sprite = Math.random() > 0.7 ? 'w_pine_tree' : 'w_med_tree';
      return new StaticObject({
        spritesheet: 'winter_outside',
        spriteKey: sprite,
        position: pos,
        width: 64,
        height: 64,
      });
    });
    this.trees.forEach((tree) =>
      this.addChild(tree.container, tree.fogOfWarContainer),
    );

    this.reindeer = [];

    this.reindeer = generateRandomReindeer(30, {
      width: this.sceneSize.width,
      height: this.sceneSize.height,
      level: this,
      dealDamage: this.dealDamage,
      remove: this.removeReindeer,
      speed: 1,
    });

    this.reindeer.forEach((reindeer) => this.addChild(reindeer.container));

    const snow = createSnow({
      position: { x: -750, y: -750 },
      width: 1400,
      height: 1400,
      intensity: 4,
      container: this.visible,
    });

    this.setEffect(snow);
    this.removeReindeer = this.removeReindeer.bind(this);

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
}

export default WinterLevel;
