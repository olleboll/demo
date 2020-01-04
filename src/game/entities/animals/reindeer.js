import PIXI from 'engine';

import {
  evaluateMove,
  calculateDistance,
  reachedTarget,
  generateRandomPoint,
} from 'engine/utils';
import { Entity } from 'engine/objects';

import { fadeOut } from 'engine/animations/fade';

class ReinDeer extends Entity {
  constructor({
    spritesheet,
    spriteKey,
    position,
    world,
    speed = 2,
    dealDamage,
    remove,
    actions,
    level,
  }) {
    super({ spritesheet, spriteKey, position, speed });
    this.remove = remove;
    this.level = level;
    this.currentSprite.animationSpeed = 0.1;
    this.sortableChildren = true;
    this.los = true;
    this.position = this.position;
    this.moving = false;
    this.moveRequest = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
    this.target = {};
    this.world = world;

    this.speed = speed;

    this.actions = actions;
    this.sightRange = 300;

    this.getCollisionBox = () => {
      return new PIXI.Rectangle(
        this.position.x - 15,
        this.position.y - 15,
        30,
        30,
      );
    };

    this.takeDamage = this.takeDamage.bind(this);

    const { hpBar, hpbg, hpContainer } = this.setUpHealthBar();
    this.addChild(hpContainer);
    this.hpBar = hpBar;
    this.hpbg = hpbg;
    this.hpContainer = hpContainer;
    this.hpContainer.position.y -= 20;
    this.hp = 10;
    this.update = this.update.bind(this);
    this.die = this.die.bind(this);
  }

  update(delta, obstacles, world) {
    const { moveRequest, position, container } = this;
    const shouldStartMove = Math.random() < 0.02;
    if (this.moving) {
      const { dx, dy, distance } = calculateDistance(
        this.position,
        this.target,
      );

      moveRequest['right'] = dx > 0 && Math.abs(dx) > this.speed * delta;
      moveRequest['left'] = dx < 0 && Math.abs(dx) > this.speed * delta;
      moveRequest['down'] = dy > 0 && Math.abs(dy) > this.speed * delta;
      moveRequest['up'] = dy < 0 && Math.abs(dy) > this.speed * delta;

      if (Object.values(moveRequest).every((m) => !m)) {
        this.moving = false;
        this.target = {};
        this.currentSprite.stop();
      } else {
        const _obstacles = this.level.getObstacles(this.position, 200);

        const { x, y, collisionX, collisionY } = evaluateMove(
          delta,
          this,
          _obstacles,
          {
            maxX: world.width / 2,
            maxY: world.height / 2,
            minX: -world.width / 2,
            minY: -world.height / 2,
          },
        );

        if (collisionX || collisionY) {
          this.target = generateRandomPoint({
            minX: this.position.x - 300,
            maxX: this.position.x + 300,
            minY: this.position.y - 300,
            maxY: this.position.y + 300,
            sizeX: 10,
            sizeY: 10,
          });
        }

        this.position.x = x;
        this.position.y = y;
        this.position.x = position.x;
        this.position.y = position.y;
        this.zIndex = position.y;
      }
    } else if (shouldStartMove) {
      this.target = generateRandomPoint({
        minX: this.position.x - 300,
        maxX: this.position.x + 300,
        minY: this.position.y - 300,
        maxY: this.position.y + 300,
        sizeX: 10,
        sizeY: 10,
      });
      this.moving = true;
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

  die() {
    const onDone = () => {
      this.remove(this);
      this.destroy({ children: true });
    };

    this.update = (delta) => {
      fadeOut(delta, this, { endAlpha: 0, fadeSpeed: 0.05 }, onDone);
    };
  }

  takeDamage(damage) {
    this.hp -= damage;
    console.log('enemy taking damage');
    if (this.hp <= 0) {
      this.die();
    }
  }
}

export default ReinDeer;
