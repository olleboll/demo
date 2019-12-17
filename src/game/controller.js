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

    if (keysDown.space && !this.keysCooldown.space) {
      this.player.dash(this.player.aim, this.medallion.currentLevel);
      this.keysCooldown.space = true;
      setTimeout(() => {
        this.keysCooldown.space = false;
      }, 100);
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
      }, 100);
    } else if (keysDown.e && this.keysToggle.e && !this.keysCooldown.e) {
      this.medallion.playerInteract(false);
      this.keysToggle.e = false;
      this.keysCooldown.e = true;
      setTimeout(() => {
        this.keysCooldown.e = false;
      }, 100);
    }
  }
}

export default Controller;
