import Level from 'engine/level';

import { generateRNGTrees } from './utils';
import { createObject } from 'engine/objects';
import { objects } from 'game/sprites';

class WinterLevel extends Level {
  constructor(props) {
    super(props);
    this.name = 'city';
    this.dealDamage = props.dealDamage;
    this.trees = props.trees.map((pos) => {
      const sprite = Math.random() > 0.7 ? 'w_pine_tree' : 'w_med_tree';
      return createObject({
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
    //this.trees = generateRNGTrees(); //generateRandomTrees(3, opts);
    // this.trees.forEach((tree) =>
    //   this.addChild(tree.container, tree.fogOfWarContainer),
    // );
    console.log(this.scene.width);
    console.log(this.scene.height);
  }
}

export default WinterLevel;
