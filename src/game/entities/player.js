import { DropShadowFilter } from 'pixi-filters';

import PIXI, { getResource } from 'engine';
import { evaluateMove, calculateDistance } from 'engine/utils';
import Entity from 'engine/objects/entity';

import { dash } from 'game/actions';

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
    this.sortableChildren = true;
    this.los = true;
    this.controls = controls;
    this.isPlayer = true;

    this.moveRequest = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
    this.world = world;

    this.aim = {};
    this.speed = speed;
    this.defaultSpeed = speed;
    this.actions = actions;
    this.actionsArray = Object.keys(this.actions).map((a) => this.actions[a]);
    this.dashDistance = 150;

    this.sightRange = 300;
    const { hpBar, hpbg, hpContainer } = this.setUpHealthBar();
    this.addChild(hpContainer);
    this.hpBar = hpBar;
    this.hpbg = hpbg;
    this.hpContainer = hpContainer;
    this.hpContainer.position.y -= 20;
    this.hp = 100;
    this.debug = 0;
    this.defaultUpdate = this.update.bind(this);
    this.setAim = this.setAim.bind(this);
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

    const { x, y, collidingObject } = evaluateMove(delta, this, obstacles, {
      maxX: world.width / 2,
      maxY: world.height / 2,
      minX: -world.width / 2,
      minY: -world.height / 2,
    });

    if (collidingObject && collidingObject.onCollision) {
      collidingObject.onCollision(this);
    }

    this.hpBar.width = (this.hpbg.width * this.hp) / 100;

    this.position.x = x;
    this.position.y = y;
    this.position.x = position.x;
    this.position.y = position.y;
    this.zIndex = position.y;

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

  dash(target, world) {
    if (this.performingDash) {
      return;
    }
    const dest = {};
    const { dx, dy, distance } = calculateDistance(this.position, target);
    if (distance === 0) return;

    const normX = dx / distance;
    const normY = dy / distance;
    dest.x = this.position.x + normX * this.dashDistance;
    dest.y = this.position.y + normY * this.dashDistance;
    const { distance: d } = calculateDistance(this.position, dest);
    const onDone = () => {
      this.speed = this.defaultSpeed;
      this.update = this.defaultUpdate.bind(this);
      this.performingDash = false;
    };
    this.performingDash = true;

    this.aim.x = this.aim.x + dx;
    this.aim.y = this.aim.y + dy;

    const performDash = dash(this, {
      target: dest,
      velocity: { x: normX, y: normY },
      onDone,
      world,
      obstacles: world.getObstacles(this.position, 350),
    });

    this.update = (delta, obstacles, world) =>
      performDash.update(delta, this, obstacles);
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
