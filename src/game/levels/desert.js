import Level from 'engine/level';

import { generateRNGTrees } from './utils';
import { StaticObject } from 'engine/objects';
import { objects } from 'game/sprites';

class DesertLevel extends Level {
  constructor(props) {
    super(props);
    this.name = 'city';
    this.dealDamage = props.dealDamage;
    this.trees = props.trees.map((pos) => {
      const sprite = Math.random() > 0.7 ? 'fall_tree' : 'dead_tree';
      return new StaticObject({
        spritesheet: 'outside',
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

export default DesertLevel;
