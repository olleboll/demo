import { DropShadowFilter } from 'pixi-filters';

import PIXI, { getResource } from 'engine';
import { evaluateMove, calculateDistance } from 'engine/utils';
import Entity from 'engine/objects/entity';
import { fadeOut, fadeIn } from 'engine/animations/fade';

import { dash, MagicLaser } from 'game/actions';

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
    medallion,
  }) {
    super({ spritesheet, spriteKey, position, speed });

    this.controls = controls;
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
    this.world = world;

    this.aim = {};
    this.speed = speed;
    this.defaultSpeed = speed;
    this.dashDistance = 150;

    this.saveTimer = 0;
    this.savedPosition = {};
    this.savedPosition.x = this.position.x;
    this.savedPosition.y = this.position.y;
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

    this.magicLaser = new MagicLaser({});
    this.magicLaser.equip(this);
    this.equipped = [];
    this.equipped.push(this.magicLaser);
    this.shootMagicParticle = this.shootMagicParticle.bind(this);
    this.die = this.die.bind(this);
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

    const { sceneSize } = world;

    const { x, y, collidingObject, moving } = evaluateMove(
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

    this.hpBar.width = (this.hpbg.width * this.hp) / 100;

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
    target = { x: this.position.x, y: this.position.y };
    target.x += this.moveRequest.right ? 10 : 0;
    target.x -= this.moveRequest.left ? 10 : 0;
    target.y += this.moveRequest.down ? 10 : 0;
    target.y -= this.moveRequest.up ? 10 : 0;

    if (target.x === 0 && target.y === 0) {
    }

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

    this.update = (delta, obstacles, world) => {
      for (let item of this.equipped) {
        item.update(delta, world);
      }
      performDash.update(delta, this, obstacles);
    };
  }

  shootMagicParticle(target, world) {
    this.magicLaser.shoot(target, world);
  }

  die() {
    const alive = () => {
      this.update = this.defaultUpdate;
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
