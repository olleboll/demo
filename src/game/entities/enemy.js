import { DropShadowFilter } from 'pixi-filters';

import PIXI, { getResource } from 'engine';
import { evaluateMove, calculateDistance } from 'engine/utils';
import { createEntity } from 'engine/objects/entity';
import { Entity } from 'engine/objects';

import { createSword } from 'game/actions';

import { characters } from 'game/sprites';

class Enemy extends Entity {
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

    this.container.sortableChildren = true;
    this.container.los = true;
    this.moveRequest = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
    this.world = world;

    this.speed = speed;

    this.actions = actions;
    this.sightRange = 300;
    this.swingRange = 30;

    this.container.getCollisionBox = () => {
      return new PIXI.Rectangle(
        this.position.x - 15,
        this.position.y - 15,
        30,
        30,
      );
    };

    this.container.takeDamage = this.takeDamage.bind(this);

    const { hpBar, hpbg, hpContainer } = this.setUpHealthBar();
    this.container.addChild(hpContainer);
    this.hpBar = hpBar;
    this.hpbg = hpbg;
    this.hpContainer = hpContainer;
    this.hpContainer.position.y -= 20;
    this.hp = 100;
  }

  update(delta, obstacles, target, world) {
    const { moveRequest, position, container } = this;

    const view = new PIXI.Circle(position.x, position.y, this.sightRange);
    this.hpBar.width = (this.hpbg.width * this.hp) / 100;

    if (view.contains(target.position.x, target.position.y)) {
      const { dx, dy, distance } = calculateDistance(position, target.position);

      const attackRadius = new PIXI.Circle(
        position.x,
        position.y,
        this.swingRange,
      );
      if (attackRadius.contains(target.position.x, target.position.y)) {
        if (!this.actions.sword.coolDown()) {
          this.actions.sword.swing(target.position);
        }
      } else {
        moveRequest['right'] = Math.abs(dx) > this.speed && dx > this.speed * 2;
        moveRequest['left'] = Math.abs(dx) > this.speed && dx < this.speed * 2;
        moveRequest['down'] = Math.abs(dy) > this.speed && dy > this.speed * 2;
        moveRequest['up'] = Math.abs(dy) > this.speed && dy < this.speed * 2;

        const _obstacles = this.level.getObstacles(this.position, 200);

        const { x, y } = evaluateMove(delta, this, obstacles, {
          maxX: world.width / 2,
          maxY: world.height / 2,
          minX: -world.width / 2,
          minY: -world.height / 2,
        });

        this.position.x = x;
        this.position.y = y;
        this.container.position.x = position.x;
        this.container.position.y = position.y;
        this.container.zIndex = position.y;
      }
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
    this.remove(this);
    this.container.destroy({ children: true });
  }

  takeDamage(damage) {
    this.hp -= damage;
    console.log('enemy taking damage');
    if (this.hp <= 0) {
      this.die();
    }
  }
}

export default Enemy;
