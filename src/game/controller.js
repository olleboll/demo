import { createKeyboardControls } from 'engine/controls';

class Controller {
  constructor(medallion, keys) {
    this.medallion = medallion;
    this.player = medallion.player;
    this.keys = keys;
    this.keyboard = createKeyboardControls(this.keys);
    this.update = this.update.bind(this);
    this.keysToggle = {};
    this.keysCooldown = {};
  }

  update() {
    const keysDown = {};
    Object.keys(this.keyboard).forEach((key) => {
      keysDown[key] = this.keyboard[key].isDown;
    });

    if (false && keysDown.space && !this.keysCooldown.space) {
      this.player.dash(this.player.aim, this.medallion.currentLevel);
      this.keysCooldown.space = true;
      setTimeout(() => {
        this.keysCooldown.space = false;
      }, 200);
    }
    if (keysDown.r) {
      this.medallion.swapUniverse();
    }
    if (keysDown.e && !this.keysToggle.e && !this.keysCooldown.e) {
      this.medallion.playerInteract(true);
      this.keysToggle.e = true;
      this.keysCooldown.e = true;
      setTimeout(() => {
        this.keysCooldown.e = false;
      }, 200);
    } else if (keysDown.e && this.keysToggle.e && !this.keysCooldown.e) {
      this.medallion.playerInteract(false);
      this.keysToggle.e = false;
      this.keysCooldown.e = true;
      setTimeout(() => {
        this.keysCooldown.e = false;
      }, 200);
    }
  }
}

export default Controller;
