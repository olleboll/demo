import Level from 'engine/level';

import { generateRNGTrees } from './utils';
import { createObject } from 'engine/objects';
import { objects } from 'game/sprites';

class CityLevel extends Level {
  constructor(props) {
    super(props);
    this.name = 'city';
    this.dealDamage = props.dealDamage;
    this.trees = props.trees.map((pos) => {
      return createObject({
        spritesheet: 'outside',
        spriteKey: objects.pine_tree,
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

export default CityLevel;
