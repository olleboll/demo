import PIXI from 'engine';
import { InteractiveObject } from 'engine/objects';

class Sign extends InteractiveObject {
  constructor(props) {
    super(props);

    this.textContainer = new PIXI.Container();
    this.background = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.background.width = 180;
    this.background.height = 100;
    this.textContainer.position.x = -this.background.width / 2;
    this.textContainer.position.y = -this.background.height * 1.7;
    this.background.tint = 0xffffff;
    this.textContainer.addChild(this.background);
    this.text = props.text;
    this.textGraphic = new PIXI.Text(this.text, {
      fontFamily: 'Verdana, Geneva, sans-serif',
      fontSize: 2,
      fill: 0x000000,
      align: 'left',
      wordWrap: true,
      wordWrapWidth: 15,
    });
    this.textGraphic.resolution = 10;

    this.background.addChild(this.textGraphic);
  }
  interact(medallion) {
    console.log('interacting with sign');
    this.addChild(this.textContainer);
  }
  stopInteract(medallion) {
    console.log('stopped interacting with sign');
    this.removeChild(this.textContainer);
  }
  update(delta, medallion) {
    if (
      !this.interactiveArea.contains(
        medallion.player.position.x,
        medallion.player.position.y,
      )
    ) {
      console.log('user is not in interactive area');
      medallion.playerInteract(false);
    }
  }
}

export default Sign;
