import { DropShadowFilter } from 'pixi-filters';

import PIXI, { getResource } from 'engine';
import { evaluateMove } from 'engine/utils';
import Entity from 'engine/objects/entity';

import { characters } from 'game/sprites';

class Player extends Entity {
  constructor({
    spritesheet,
    spriteKey,
    position,
    controls,
    world,
    speed = 2,
    dealDamage,
    actions,
  }) {
    super({ spritesheet, spriteKey, position, speed });

    this.currentSprite.animationSpeed = 0.1;
    this.container.sortableChildren = true;
    this.container.los = true;
    this.controls = controls;

    this.moveRequest = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
    this.world = world;

    this.aim = {};
    this.speed = speed;
    this.actions = actions;
    this.actionsArray = Object.keys(this.actions).map((a) => this.actions[a]);

    this.sightRange = 300;
    const { hpBar, hpbg, hpContainer } = this.setUpHealthBar();
    this.container.addChild(hpContainer);
    this.hpBar = hpBar;
    this.hpbg = hpbg;
    this.hpContainer = hpContainer;
    this.hpContainer.position.y -= 20;
    this.hp = 100;
    this.debug = 0;
  }

  setAim({ x, y }) {
    this.aim.x = x;
    this.aim.y = y;
  }
  update(delta, obstacles, world) {
    const { controls, moveRequest, position, container } = this;
    Object.keys(controls).forEach((key) => {
      if (moveRequest[key] !== undefined) {
        moveRequest[key] = controls[key].isDown;
      }
    });

    const { x, y } = evaluateMove(delta, this, obstacles, {
      maxX: world.width / 2,
      maxY: world.height / 2,
      minX: -world.width / 2,
      minY: -world.height / 2,
    });

    this.hpBar.width = (this.hpbg.width * this.hp) / 100;

    this.position.x = x;
    this.position.y = y;
    this.container.position.x = position.x;
    this.container.position.y = position.y;
    this.container.zIndex = position.y;

    for (let action of this.actionsArray) {
      action.update(delta, obstacles);
    }
  }
  setUpHealthBar() {
    const hpContainer = new PIXI.Container();
    const hpbg = new PIXI.Graphics()
      .moveTo(-20, -25)
      .lineStyle(1, 0)
      .beginFill(0x000000, 1)
      .lineTo(20, -25)
      .lineTo(20, -15)
      .lineTo(-20, -15)
      .lineTo(-20, -25)
      .endFill();
    const hpBar = new PIXI.Graphics()
      .moveTo(-20, -25)
      .lineStyle(2, 0)
      .beginFill(0xff0000, 1)
      .lineTo(20, -25)
      .lineTo(20, -15)
      .lineTo(-20, -15)
      .lineTo(-20, -25)
      .endFill();
    hpContainer.addChild(hpbg);
    hpContainer.addChild(hpBar);
    return { hpContainer, hpBar, hpbg };
  }

  takeDamage(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      alert('you died, noob!');
      window.location.reload();
    }
  }
}

export default Player;
