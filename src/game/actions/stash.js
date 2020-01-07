const laser = () => {
  const shoot = () => {
    let midPoint = { x: start.x + dx / 2, y: start.y + dy / 2 };
    const r = 300;
    shootingParticle.subTargets = [];
    for (let i = 0; i < 4; i++) {
      const nextGoal = generateRandomPoint({
        minX: midPoint.x - r,
        maxX: midPoint.x + r,
        minY: midPoint.y - r,
        maxY: midPoint.y + r,
        sizeX: 1,
        sizeY: 1,
      });
      console.log(nextGoal);
      const { dx, dy, distance: d } = calculateDistance(nextGoal, target);
      const velX = (dx / d) * speed;
      const velY = (dy / d) * speed;
      const goalSpeed = { x: velX, y: velY };
      nextGoal.speed = goalSpeed;
      midPoint = {
        x: nextGoal.x + dx / 2,
        y: nextGoal.y + dy / 2,
      };
      shootingParticle.subTargets.push(nextGoal);
    }

    shootingParticle.start = start;
    shootingParticle.position = start;
    shootingParticle.target = target;
    shootingParticle.subTargets.push(target);
    shootingParticle.currentTarget = 0;
    shootingParticle.path = [];
  };

  const update = () => {
    if (particle.reachedTarget) {
      if (particle.counter < 0) {
        world.removeChild(particle.trailContainer);
        particle.trailContainer.destroy();
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
    } else {
      if (particle.currentTarget >= particle.subTargets.length) {
        particle.reachedTarget = true;
        particle.trail
          .clear()
          .lineStyle(2, 0)
          .beginFill(0xaa0000, 1)
          .moveTo(particle.start.x, particle.start.y);
        for (let next of particle.path) {
          particle.trail.lineTo(next.x, next.y);
        }
        particle.trail.endFill();

        particle.counter = 10;

        const aoeGraphic = new PIXI.Graphics()
          .lineStyle(1, 0)
          .beginFill(0xaa0000, 0.3)
          .drawCircle(particle.target.x, particle.target.y, this.aoe)
          .endFill();
        particle.trailContainer.addChild(aoeGraphic);
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
        const currentTarget = particle.subTargets[particle.currentTarget];
        const newX = particle.position.x + currentTarget.speed.x * delta;
        const newY = particle.position.y + currentTarget.speed.y * delta;
        if (
          reachedTarget({
            position: { x: newX, y: newY },
            target: currentTarget,
            offset: {
              x: currentTarget.speed.x * delta,
              y: currentTarget.speed.y * delta,
            },
          })
        ) {
          particle.path.push(currentTarget);
          particle.position = currentTarget;
          particle.currentTarget++;
          console.log('happens?');
        } else {
          const newPos = { x: newX, y: newY };
          particle.path.push(newPos);
          particle.position = newPos;
        }

        particle.trail
          .clear()
          .lineStyle(2, 0)
          .beginFill(0xaa0000, 1)
          .moveTo(particle.start.x, particle.start.y);

        for (let i = 0; i < particle.path.length; i++) {
          const next = particle.path[i];
          particle.trail.lineTo(next.x, next.y);
        }
        particle.trail.endFill();
      }
    }
  };
};
