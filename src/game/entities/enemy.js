import { Howl, Howler } from 'howler';

import { DropShadowFilter } from 'pixi-filters';

import PIXI, { getResource } from 'engine';
import { evaluateMove, calculateDistance } from 'engine/utils';
import { createEntity } from 'engine/objects/entity';
import { Entity } from 'engine/objects';

import { fadeOut } from 'engine/animations/fade';

import { createSword } from 'game/actions';

import { characters } from 'game/sprites';

const sound = new Howl({
  src: ['/static/audio/woosh.m4a'],
  autoplay: true,
  sprite: {
    swing: [7200, 1000],
  },
});

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

    this.sortableChildren = true;
    this.los = true;
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
    this.hp = 100;
    this.die = this.die.bind(this);
  }

  update(delta, obstacles, target, world) {
    const { moveRequest, position } = this;

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
          const soundId = sound.play('swing');
          this.actions.sword.swing(target.position);
        }
      } else {
        moveRequest['right'] = dx > 0 && Math.abs(dx) > this.speed * delta;
        moveRequest['left'] = dx < 0 && Math.abs(dx) > this.speed * delta;
        moveRequest['down'] = dy > 0 && Math.abs(dy) > this.speed * delta;
        moveRequest['up'] = dy < 0 && Math.abs(dy) > this.speed * delta;

        const _obstacles = this.level.getObstacles(this.position, 200);

        const move = evaluateMove(delta, this, obstacles, {
          maxX: world.width / 2,
          maxY: world.height / 2,
          minX: -world.width / 2,
          minY: -world.height / 2,
        });
        const { x, y } = move;

        this.position.x = x;
        this.position.y = y;
        this.zIndex = position.y;
      }
    } else {
      this.currentSprite.stop();
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
      this.level.removeChild(this);
      this.remove(this);
      this.destroy({ children: true });
    };

    this.update = (delta) => {
      fadeOut(delta, this, { endAlpha: 0, fadeSpeed: 0.05 }, onDone.bind(this));
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

export default Enemy;
