import Level from 'engine/level';

import { generateRNGTrees } from './utils';

class CityLevel extends Level {
  constructor(props) {
    super(props);
    this.name = 'city';
    this.dealDamage = props.dealDamage;
    this.trees = generateRNGTrees(); //generateRandomTrees(3, opts);
    // this.trees.forEach((tree) =>
    //   this.addChild(tree.container, tree.fogOfWarContainer),
    // );
    console.log(this.scene.width);
    console.log(this.scene.height);
  }
}

export default CityLevel;
