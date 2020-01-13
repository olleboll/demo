import PIXI from 'engine';
import { adjustCoordToViewPort } from 'engine/utils';
import { InteractiveObject } from 'engine/objects';

class Sign extends InteractiveObject {
  constructor(props) {
    super(props);

    this.textContainer = new PIXI.Container();
    this.background = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.background.width = 180;
    this.background.height = 100;
    this.textContainer.zIndex = this.textContainer.position.y;
    this.background.tint = 0xffffff;
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
    this.textContainer.addChild(this.background);
  }
  interact(medallion) {
    console.log('interacting with sign');
    const rendererPositionNear = medallion.currentLevel.scene.toLocal({
      x: 0,
      y: 0,
    });
    const rendererPositionFar = medallion.currentLevel.scene.toLocal({
      x: medallion.renderer.width,
      y: medallion.renderer.height,
    });
    // TODO: make sign always appear over player
    const pos = adjustCoordToViewPort(
      {
        totalWidth: medallion.currentLevel.sceneSize.width,
        totalHeight: medallion.currentLevel.sceneSize.height,
        viewWidth: medallion.renderer.width,
        viewHeight: medallion.renderer.height,
        farPos: rendererPositionFar,
        nearPos: rendererPositionNear,
      },
      medallion.player.position,
    );

    this.textContainer.position.x = pos.x - this.textContainer.width / 2;
    this.textContainer.position.y = pos.y - this.textContainer.height - 75;

    medallion.gui.addChild(this.textContainer);
  }
  stopInteract(medallion) {
    console.log('stopped interacting with sign');
    medallion.gui.removeChild(this.textContainer);
    //this.removeChild(this.textContainer);
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
