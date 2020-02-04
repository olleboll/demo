import Ola from 'ola';
import { DropShadowFilter } from 'pixi-filters';

import PIXI, { getResource } from 'engine';
import { evaluateMove2, calculateDistance } from 'engine/utils';
import Entity from 'engine/objects/entity';
import { fadeOut, fadeIn } from 'engine/animations/fade';

import { dash, MagicMissile } from 'game/actions';

import { characters } from 'game/sprites';

class Player extends Entity {
  constructor({
    spritesheet,
    spriteKey,
    position,
    controls,
    world,
    speed = 3,
    dealDamage,
    actions,
    medallion,
  }) {
    super({ spritesheet, spriteKey, position, speed });

    this.dir = 'down';
    this.controls = controls;
    this.medallion = medallion;
    this.currentSprite.animationSpeed = 0.1;

    this.sortableChildren = true;
    this.los = true;
    this.isPlayer = true;

    this.moveRequest = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
    this.movements = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
    this.world = world;

    this.aim = {};
    this.speed = 0;
    this.velocity = { x: Ola({ value: 0 }), y: Ola({ value: 0 }) };
    this.defaultSpeed = 0;
    this.maxSpeed = speed;
    this.acceleratingSpeed = null;

    this.saveTimer = 0;
    this.savedPosition = {};
    this.savedPosition.x = this.position.x;
    this.savedPosition.y = this.position.y;
    this.sightRange = 300;

    // const { hpBar, hpbg, hpContainer } = this.setUpHealthBar();
    // this.addChild(hpContainer);
    // this.hpBar = hpBar;
    // this.hpbg = hpbg;
    // this.hpContainer = hpContainer;
    // this.hpContainer.position.y -= 20;
    // this.hp = 100;

    const { chargeBar, chargebg, chargeContainer } = this.setUpChargeBar();
    this.addChild(chargeContainer);
    this.chargeBar = chargeBar;
    this.chargebg = chargebg;
    this.chargeContainer = chargeContainer;
    this.chargeContainer.position.y = this.currentSprite.height;
    this.dashSpeed = 12;
    this.miniumDashDuration = 300;
    this.dashDuration = 100;
    this.maxDashDuration = 1000;
    this.dashFactor = (this.maxDashDuration - this.miniumDashDuration) / 40;

    this.debug = 0;
    this.defaultUpdate = this.update.bind(this);
    this.setAim = this.setAim.bind(this);

    this.actions = {};
    this.equipped = [];
    this.shootMagicParticle = this.shootMagicParticle.bind(this);
    this.die = this.die.bind(this);
    this.equipItem = this.equipItem.bind(this);
    this.chargeDash = this.chargeDash.bind(this);
    this.dash = this.dash.bind(this);
    this.pausDash = this.pausDash.bind(this);
    this.resumeDash = this.resumeDash.bind(this);

    console.log('initalized player');
    console.log(this);
  }

  equipItem(name, item) {
    this.actions[name] = item;
    this.equipped.push(item);
  }

  setAim({ x, y }) {
    this.aim.x = x;
    this.aim.y = y;
  }

  update(delta, obstacles, world) {
    const { controls, moveRequest, position, container } = this;
    const oldPos = {};
    oldPos.x = position.x;
    oldPos.y = position.y;
    let isMoving = false;
    Object.keys(controls).forEach((key) => {
      if (moveRequest[key] !== undefined) {
        moveRequest[key] = controls[key].isDown;
        if (moveRequest[key]) {
          isMoving = true;
          if (!this.movements[key]) {
            this.movements[key] = true;
            if (key === 'up') {
              this.velocity.y.set({ value: -this.maxSpeed }, 100);
            }
            if (key === 'down') {
              this.velocity.y.set({ value: this.maxSpeed }, 100);
            }
            if (key === 'left') {
              this.velocity.x.set({ value: -this.maxSpeed }, 100);
            }
            if (key === 'right') {
              this.velocity.x.set({ value: this.maxSpeed }, 100);
            }
          } else {
            this.movements[key] = false;
          }
        }
      }
    });
    Object.keys(controls).forEach((key) => {
      if (!moveRequest[key]) {
        if (key === 'up' && !moveRequest['down']) {
          this.velocity.y.set({ value: 0 }, 50);
        }
        if (key === 'down' && !moveRequest['up']) {
          this.velocity.y.set({ value: 0 }, 50);
        }
        if (key === 'left' && !moveRequest['right']) {
          this.velocity.x.set({ value: 0 }, 50);
        }
        if (key === 'right' && !moveRequest['left']) {
          this.velocity.x.set({ value: 0 }, 50);
        }
      }
    });

    this.isMoving = isMoving;

    const { sceneSize } = world;

    const { x, y, collidingObject, moving, dir } = evaluateMove2(
      delta,
      this,
      obstacles,
      {
        maxX: sceneSize.width / 2,
        maxY: sceneSize.height / 2,
        minX: -sceneSize.width / 2,
        minY: -sceneSize.height / 2,
      },
    );

    if (dir) {
      this.dir = dir;
    }

    //this.hpBar.width = (this.hpbg.width * this.hp) / 100;

    this.position.x = x;
    this.position.y = y;
    this.zIndex = position.y;

    this.saveTimer += delta;
    if (this.saveTimer > 300) {
      this.savedPosition.x = this.position.x;
      this.savedPosition.y = this.position.y;
      this.saveTimer = 0;
    }

    for (let item of this.equipped) {
      item.update(delta, world);
    }

    if (collidingObject && collidingObject.onCollision) {
      collidingObject.onCollision(this);
    }

    world.moveObjectInGrid(this, oldPos);

    if (this.chargingDash && this.dashDuration < this.maxDashDuration) {
      this.dashDuration += 15 * delta;
      this.chargeBar.width =
        (-this.miniumDashDuration + this.dashDuration) / this.dashFactor;
      const dashRange = this.dashSpeed * this.dashDuration * 0.032;

      world.removeChild(this.dashRangeGraphic);
      this.dashRangeGraphic = new PIXI.Graphics()
        .lineStyle(1, 0)
        .beginFill(0xaa0000, 0.3)
        .drawCircle(this.position.x, this.position.y, dashRange)
        .endFill();
      world.addChild(this.dashRangeGraphic);
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

  setUpChargeBar() {
    const chargeContainer = new PIXI.Container();
    const chargebg = new PIXI.Graphics()
      .moveTo(-20, -25)
      .lineStyle(1, 0)
      .beginFill(0x000000, 1)
      .lineTo(20, -25)
      .lineTo(20, -15)
      .lineTo(-20, -15)
      .lineTo(-20, -25)
      .endFill();
    const chargeBar = new PIXI.Graphics()
      .moveTo(-20, -25)
      .lineStyle(2, 0)
      .beginFill(0x58cced, 1)
      .lineTo(20, -25)
      .lineTo(20, -15)
      .lineTo(-20, -15)
      .lineTo(-20, -25)
      .endFill();
    chargeContainer.addChild(chargebg);
    chargeContainer.addChild(chargeBar);
    return { chargeContainer, chargeBar, chargebg };
  }

  chargeDash() {
    if (!this.chargingDash) {
      this.chargingDash = true;
      this.dashDuration = 300;
    }
  }

  pausDash() {
    if (this.dashTimer) {
      this.dashTimer.paus();
    }
  }
  resumeDash() {
    if (this.dashTimer) {
      this.dashTimer.play();
    }
  }

  dash(target, world) {
    if (this.performingDash || this.isBusy) {
      return;
    }
    world.removeChild(this.dashRangeGraphic);

    target = this.aim;
    // target = { x: this.position.x, y: this.position.y };
    // target.y += this.dir === 'down' ? 10 : 0;
    // target.y -= this.dir === 'up' ? 10 : 0;
    // target.x += this.dir === 'right' ? 10 : 0;
    // target.x -= this.dir === 'left' ? 10 : 0;

    // target.x = this.position.x + this.velocity.x.value;
    // target.y = this.position.y + this.velocity.y.value;
    console.log('doing dash');
    console.log(target);

    // TODO:
    // Fuck duration!
    // Make target the destination and then we can move the target around with keys and turn that way

    const { dx, dy, distance } = calculateDistance(this.position, target);
    if (distance === 0) return;

    const normX = dx / distance;
    const normY = dy / distance;
    const dest = {};
    dest.x = this.position.x + normX * 1000;
    dest.y = this.position.y + normY * 1000;
    const { distance: d } = calculateDistance(this.position, dest);
    const onDone = () => {
      this.speed = this.defaultSpeed;
      this.update = this.defaultUpdate.bind(this);
      this.performingDash = false;
      this.dashDuration = 0;
      this.chargingDash = false;
    };
    this.performingDash = true;
    this.aim.x = this.aim.x + dx;
    this.aim.y = this.aim.y + dy;
    const performDash = dash(this, {
      target: dest,
      velocity: { x: normX, y: normY },
      onDone,
      world,
      duration: this.dashDuration,
      startPosition: { x: this.position.x, y: this.position.y },
      obstacles: world.getObstacles(this.position, 350),
      speed: this.dashSpeed,
    });
    this.dashTimer = performDash.timer(this.dashDuration);
    this.dashTimer.play();

    this.update = (delta, obstacles, world) => {
      for (let item of this.equipped) {
        item.update(delta, world);
      }
      performDash.update(delta, this, obstacles);
    };
  }

  executeAction(name, target, level) {
    if (this.actions[name] && !this.busy) {
      this.actions[name].execute(target, level);
    }
  }

  shootMagicParticle(target, world) {
    if (this.isBusy) {
      return;
    }
    this.magicLaser.shoot(target, world);
  }

  die() {
    // MAybe sonehting like a priority order?
    // is busy takes a number?
    // for now only bool
    this.isBusy = true;
    const alive = () => {
      this.update = this.defaultUpdate;
      this.isBusy = false;
    };

    const respawn = () => {
      this.position.x = this.savedPosition.x;
      this.position.y = this.savedPosition.y;
      this.update = (delta) => {
        fadeIn(delta, this, { endAlpha: 1, fadeSpeed: 0.01 }, alive.bind(this));
      };
    };

    this.update = (delta) => {
      fadeOut(
        delta,
        this,
        { endAlpha: 0, fadeSpeed: 0.01 },
        respawn.bind(this),
      );
    };
  }

  takeDamage(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.die();
    }
  }
}

export default Player;
