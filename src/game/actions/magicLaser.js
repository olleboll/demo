import PIXI, { getResource } from 'engine';

import {
  calculateDistance,
  reachedTarget,
  getLinesOfRect,
  contains,
  generateRandomPoint,
} from 'engine/utils';

class MagicLaser {
  constructor(opts) {
    const {
      damage = 10,
      particles = 7,
      width = 25,
      height = 25,
      speed = 1,
      aoe = 30,
    } = opts;
    this.container = new PIXI.Container();
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.damage = damage;
    this.aoe = aoe;
    this.idleParticles = this.setUpParticles(particles, width, height, speed);
    this.idleParticles.forEach((particle) =>
      this.container.addChild(particle.sprite),
    );
    this.shootingParticles = [];

    this.update = this.update.bind(this);
    this.shoot = this.shoot.bind(this);
  }

  setUpParticles(no, width, height, speed) {
    const particles = [];
    for (let i = 0; i < no; i++) {
      const particle = this.createParticle(width, height, speed);
      particles.push(particle);
    }
    return particles;
  }

  createParticle(width, height, speed) {
    const particle = {};
    particle.sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    particle.sprite.tint = 0xaa0000;
    particle.sprite.position.x = -width / 2 + Math.random() * width;
    particle.sprite.position.y = -height / 2 + Math.random() * height;
    particle.sprite.width = 4;
    particle.sprite.height = 4;
    particle.speed = {};
    const speedX = speed + Math.random() * speed;
    const speedY = speed + Math.random() * speed;
    particle.speed.x = Math.random() > 0.5 ? -1 * speedX : speedX;
    particle.speed.y = Math.random() > 0.5 ? -1 * speedY : speedY;
    return particle;
  }

  shoot(target, level) {
    console.log(this.idleParticles);
    if (this.idleParticles.length === 0) return;
    console.log('length is more than 0');
    // const i = parseInt(
    //   Math.floor(Math.random() * this.idleParticles.length - 1),
    // );
    const i = Math.floor(Math.random() * this.idleParticles.length);
    if (i === -1) return;

    const shootingParticle = this.idleParticles[i];
    shootingParticle.target = target;
    shootingParticle.position = {};
    shootingParticle.position.x = shootingParticle.sprite.position.x;
    shootingParticle.position.y = shootingParticle.sprite.position.y;
    const start = level.scene.toLocal({ x: 0, y: 0 }, shootingParticle.sprite);

    const { dx, dy, distance: d } = calculateDistance(start, target);
    const speed = 12;
    const velX = (dx / d) * speed;
    const velY = (dy / d) * speed;
    shootingParticle.speed = { x: velX, y: velY };

    shootingParticle.start = start;
    shootingParticle.position = start;
    shootingParticle.target = target;

    console.log('genereated path');
    console.log(shootingParticle);

    shootingParticle.trailContainer = new PIXI.Container();
    shootingParticle.trail = new PIXI.Graphics();
    shootingParticle.trailContainer.noCull = true;
    shootingParticle.trailContainer.addChild(shootingParticle.trail);
    level.addChild(shootingParticle.trailContainer);

    this.shootingParticles.push(shootingParticle);

    this.idleParticles.splice(i, 1);
    this.container.removeChild(shootingParticle.sprite);
    shootingParticle.sprite.destroy();
    console.log('destroyed');
    console.log(level);

    const { animations } = getResource('dash', 'spritesheet');
    const missile = new PIXI.AnimatedSprite(animations[`magic_missile`]);
    missile.anchor.set(0.5, 0.8);
    missile.scale.x = 2;
    missile.scale.y = 2;
    let rotation = Math.atan(dy / dx) + Math.PI / 2;
    if (dx < 0) rotation += Math.PI;
    missile.rotation = rotation + Math.PI;

    missile.animationSpeed = 1;
    missile.play();
    missile.position = shootingParticle.position;
    shootingParticle.missile = missile;
    shootingParticle.trailContainer.addChild(missile);
  }

  update(delta, world) {
    this.lastDelta = delta;
    for (let particle of this.idleParticles) {
      particle.sprite.position.x += particle.speed.x * delta;
      particle.sprite.position.y += particle.speed.y * delta;
      if (particle.sprite.position.x > this.width) {
        particle.speed.x *= -1;
        particle.sprite.position.x = this.width - 5;
      }
      if (particle.sprite.position.x < -this.width) {
        particle.speed.x *= -1;
        particle.sprite.position.x = -this.width + 5;
      }
      if (particle.sprite.position.y > this.height) {
        particle.speed.y *= -1;
        particle.sprite.position.y = this.height - 5;
      }
      if (particle.sprite.position.y < -this.height) {
        particle.speed.y *= -1;
        particle.sprite.position.y = -this.height + 5;
      }
    }

    for (let particle of this.shootingParticles) {
      if (particle.reachedTarget) {
        if (particle.counter < 0) {
          world.removeChild(particle.trailContainer);
          particle.trailContainer.destroy({ children: true });
          particle.done = true;
          const newParticle = this.createParticle(
            this.width,
            this.height,
            this.speed,
          );
          this.idleParticles.push(newParticle);
          this.container.addChild(newParticle.sprite);
        } else {
          particle.counter--;
        }
      } else if (
        !particle.reachedTarget &&
        reachedTarget({
          position: particle.position,
          target: particle.target,
          offset: { x: particle.speed.x * delta, y: particle.speed.y * delta },
        })
      ) {
        particle.missile.position = particle.target;
        particle.reachedTarget = true;
        particle.counter = 10;
        // particle.trail
        //   .clear()
        //   .lineStyle(2, 0)
        //   .beginFill(0xaa0000, 1)
        //   .moveTo(particle.start.x, particle.start.y)
        //   .lineTo(particle.target.x, particle.target.y)
        //   .endFill();
        //
        // const aoeGraphic = new PIXI.Graphics()
        //   .lineStyle(1, 0)
        //   .beginFill(0xaa0000, 0.3)
        //   .drawCircle(particle.target.x, particle.target.y, this.aoe)
        //   .endFill();
        // particle.trailContainer.addChild(aoeGraphic);
        // Deal damage!
        const objectsInAoe = world
          .getObstacles(particle.target, 150)
          .filter((o) => o.takeDamage && !o.isPlayer);
        const damageArea = new PIXI.Circle(
          particle.target.x,
          particle.target.y,
          this.aoe,
        );
        for (let o of objectsInAoe) {
          const {
            points: { p1, p2, p3, p4 },
          } = getLinesOfRect(o.getCollisionBox());
          const pointsArray = [p1, p2, p3, p4];
          for (let p of pointsArray) {
            if (damageArea.contains(p.x, p.y)) {
              o.takeDamage(this.damage);
            }
          }
        }
      } else {
        const newX = particle.position.x + particle.speed.x * delta;
        const newY = particle.position.y + particle.speed.y * delta;
        // particle.trail
        //   .clear()
        //   .lineStyle(2, 0)
        //   .beginFill(0xaa0000, 1)
        //   .moveTo(particle.start.x, particle.start.y)
        //   .lineTo(newX, newY)
        //   .endFill();
        const newPos = { x: newX, y: newY };
        particle.position = newPos;
        particle.missile.position = newPos;
      }
    }
    this.shootingParticles = this.shootingParticles.filter((p) => !p.done);
  }

  equip(parent) {
    this.parent = parent;
    this.parent.addChild(this.container);
    // this will only work when anchor is by the characters feet
    this.container.position.x = 0;
    this.container.position.y = -this.parent.height / 2;
  }
  unEquip() {
    this.parent.removeChild(this.container);
    this.container.destroy();
  }
}

export default MagicLaser;
