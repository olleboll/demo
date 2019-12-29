import PIXI from 'engine';

import StaticObject from './static';

class InteractiveObject extends StaticObject {
  constructor(props) {
    super(props);

    // this sbiuld probably be a seperate class.. like Sign?
    // So this shioud be copied somewhere else..
    const textSprite = new PIXI.Text(`This is a test sign`, {
      fill: '#ff8000',
    });
    const textBg = new PIXI.Sprite(PIXI.Texture.BLACK);
    textBg.width = textSprite.width;
    textBg.height = textSprite.height;
    this.textBg = textBg;
    this.textSprite = textSprite;
    this.textContainer = new PIXI.Container();
    this.textContainer.addChild(this.textBg);
    this.textContainer.addChild(this.textSprite);
    this.textContainer.visible = false;
    this.textContainer.position.x = 200;
    this.textContainer.position.y = 200;
  }
  interact(medallion) {
    console.log('yeah!');
    this.textContainer.visible = true;
  }
  stopInteract(medallion) {
    console.log('stopped!');

    this.textContainer.visible = false;
  }
}

export default InteractiveObject;
