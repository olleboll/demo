import PIXI from 'engine';

import { getResource } from 'engine';

import {
  calculateDistance,
  checkCollision,
  getLinesOfRect,
  findIntersectingLine,
  findIntersectionPoint,
  contains,
  reachedTarget,
} from 'engine/utils';

import { Enemy } from 'game/entities';

class Bow {
  constructor({ spriteKey, dealDamage, player, quiverSize = 100, renderer }) {
    const { textures } = getResource('bomb_arrow');
    this.texture = textures['obj_14'];
    this.isPlayer = player;
    this.dealDamage = dealDamage;
    this.parent = null;
    this.renderer = renderer;
    this.arrows = [];
    this.arrowSpeed = 5;
    this.speed = 7;
    this.minPower = 2;
    this.maxPower = 10;
    this.power = 0;
    this.linger = 100;
    this.trailLinger = 50;
    this.quiverSize = 100;
    this.drawn = false;
    this.shoot = this.shoot.bind(this);
    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
    this.execute = this.execute.bind(this);
    this.executions = {
      fire: this.shoot,
      draw: this.draw,
    };
  }

  setParent(container) {
    this.parent = container;
    const { powerBar, powerBg, powerContainer } = this.setUpPowerBar();
    this.parent.addChild(powerContainer);
    this.powerBar = powerBar;
    this.powerbg = powerBg;
    this.powerContainer = powerContainer;
    this.power = 0;
  }

  execute(action, params) {
    this.executions[action](params);
  }

  draw() {
    console.log('drawn');
    this.drawn = true;
  }

  shoot({ target, world }) {
    if (!this.drawn) return;
    this.drawn = false;
    if (this.arrows.length > this.quiverSize) return;
    this.world = world;
    const power = this.power >= this.maxPower ? this.maxPower : this.power;
    const { x, y } = this.parent.position;

    this.power = this.minPower;
    const { dx, dy, distance: d } = calculateDistance(
      this.parent.position,
      target,
    );
    const velX = (dx / d) * this.arrowSpeed;
    const velY = (dy / d) * this.arrowSpeed;

    let rotation = Math.atan(dy / dx) + Math.PI / 2;
    if (dx < 0) rotation += Math.PI;

    const sprite = new PIXI.Sprite(this.texture);

    sprite.anchor.set(0.5, 0.4);
    sprite.position.x = this.parent.position.x;
    sprite.position.y = this.parent.position.y;
    sprite.rotation = rotation;

    const shot = { p1: this.parent.position, p2: target };

    const targets = world.scene.visible.children.sort((a, b) => {
      let { distance: dA } = calculateDistance(shot.p1, {
        x: a.position.x,
        y: a.position.y,
      });
      let { distance: dB } = calculateDistance(shot.p1, {
        x: b.position.x,
        y: b.position.y,
      });
      return dA - dB;
    });

    let arrowDestination = target;
    let damageMultiplier = power === this.maxPower ? 20 : power;
    for (let o of targets) {
      if (!o.getCollisionBox) continue;

      const hitbox = o.getCollisionBox();

      const hitboxLines = [
        {
          p1: { x: hitbox.x, y: hitbox.y },
          p2: { x: hitbox.x, y: hitbox.y + hitbox.height },
        },
        {
          p1: { x: hitbox.x, y: hitbox.y + hitbox.height },
          p2: { x: hitbox.x + hitbox.width, y: hitbox.y + hitbox.height },
        },
        {
          p1: { x: hitbox.x + hitbox.width, y: hitbox.y + hitbox.height },
          p2: { x: hitbox.x + hitbox.width, y: hitbox.y },
        },
        {
          p1: { x: hitbox.x + hitbox.width, y: hitbox.y },
          p2: { x: hitbox.x, y: hitbox.y },
        },
      ];

      const intersectionPoints = findIntersectionPoint(shot, hitboxLines);

      if (intersectionPoints.length) {
        const hit = intersectionPoints.sort((a, b) => {
          let { distance: dA } = calculateDistance(shot.p1, { x: a.x, y: a.y });
          let { distance: dB } = calculateDistance(shot.p1, { x: b.x, y: b.y });
          return dA - dB;
        })[0];
        arrowDestination = hit;
        if (o.takeDamage) {
          o.takeDamage(10 + 3 * damageMultiplier);
        }
        // const debug = new PIXI.Graphics()
        //   .lineStyle(2, 0)
        //   .beginFill(0xffffff, 1)
        //   .drawRect(hit.x, hit.y, 10, 10)
        //   .endFill();
        // debug.zIndex = 2000;
        // world.addChild(debug, debug.clone());
        break;
      }
    }
    const spriteContainer = new PIXI.Container();
    const trailContainer = new PIXI.Container();
    const trail = new PIXI.Graphics();

    trailContainer.addChild(trail);
    world.addChild(trailContainer);

    spriteContainer.addChild(sprite);
    world.addChild(spriteContainer);
    this.arrows.push({
      start: { x: this.parent.position.x, y: this.parent.position.y },
      velocity: { x: velX * power, y: velY * power },
      target: arrowDestination,
      power,
      sprite,
      linger: this.linger,
      done: false,
      trail: trailContainer,
    });
  }

  update(delta, obstacles) {
    for (let i = this.arrows.length; i > 0; i--) {
      const arrow = this.arrows[i - 1];
      let newPosX = arrow.sprite.position.x + arrow.velocity.x * delta;
      let newPosY = arrow.sprite.position.y + arrow.velocity.y * delta;

      if (
        reachedTarget({
          position: arrow.sprite.position,
          target: arrow.target,
          offset: { x: arrow.velocity.x * delta, y: arrow.velocity.y * delta },
        })
      ) {
        arrow.sprite.position.x = arrow.target.x;
        arrow.sprite.position.y = arrow.target.y;
        arrow.done = true;
      }

      if (arrow.done) {
        arrow.trail.alpha -= 0.1;
        arrow.linger -= 1 * delta;
        if (arrow.linger < 0) {
          this.world.removeChild(arrow.sprite);
          arrow.sprite.destroy({ children: true });
          this.arrows.splice(i - 1, 1);
        }
        if (arrow.linger < this.trailLinger) {
          this.world.removeChild(arrow.trail);
          arrow.trail.destroy({ children: true });
        }
      } else {
        arrow.sprite.position.x = newPosX;
        arrow.sprite.position.y = newPosY;
        arrow.sprite.zIndex = arrow.sprite.position.y;

        const trail = arrow.trail.children[0];
        trail
          .clear()
          .lineStyle(arrow.power, 0)
          .beginFill(0x7ef9ff, 1)
          .moveTo(arrow.start.x, arrow.start.y)
          .lineTo(newPosX, newPosY)
          .endFill();
      }
    }
    if (this.drawn) {
      this.power =
        this.power < this.maxPower ? this.power + 0.1 * delta : this.maxPower;
      const scale = 20 / this.maxPower;
      this.powerBar.height = this.power * scale;
    } else {
      this.powerBar.height = 0;
      this.power = this.minPower;
    }
  }

  setUpPowerBar() {
    const powerContainer = new PIXI.Container();
    const powerBg = new PIXI.Graphics()
      .lineStyle(1, 0)
      .beginFill(0x000000, 1)
      .drawRect(20, -5, 5, -20)
      .endFill();
    const powerBar = new PIXI.Graphics()
      .lineStyle(1, 0)
      .beginFill(0x7ef9ff, 1)
      .drawRect(20, -5, 5, -20)
      .endFill();
    powerBar.height = 0;
    powerContainer.addChild(powerBg);
    powerContainer.addChild(powerBar);
    return { powerContainer, powerBar, powerBg };
  }
}

const createBow = ({ spriteKey, range, dealDamage, player = false }) => {
  return new Bow({
    spriteKey,
    dealDamage,
    player,
  });
};

export default Bow;
