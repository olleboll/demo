// @flow
//import { AlphaFilter } from 'pixi-filters';

import PIXI, { getResource } from 'engine';

import Camera from 'engine/camera';
import type { Entity } from 'engine/objects';
import type { Point } from 'engine/utils';

import {
  calculateFieldOfView,
  adjustCenterToViewport,
  checkCollision,
} from 'engine/utils';

import { generateGrid, pointToSquare, includeAdjecentSquares } from './utils';

class Level {
  constructor({ name, renderer, dark, light, hasCamera = false, spriteKey }) {
    this.name = name;
    const scene = new PIXI.Container();
    const visible = new PIXI.Container();
    const fogOfWar = new PIXI.Container();
    const mask = new PIXI.Container();
    this.effects = [];

    const { map } = getResource(spriteKey).textures;

    const background = new PIXI.Sprite(map);
    background.zIndex = -background.height / 2;
    background.name = 'backgroundImage';
    background.position.x = -background.width / 2;
    background.position.y = -background.height / 2;
    visible.addChild(background);
    visible.sortableChildren = true;
    visible.filters = [new PIXI.filters.AlphaFilter(light)];
    visible.mask = mask;
    this.visibleMasks = {};

    const staticBackground = new PIXI.Sprite(map);
    staticBackground.zIndex = -staticBackground / 2;
    staticBackground.name = 'backgroundImage';
    staticBackground.position.x = -staticBackground.width / 2;
    staticBackground.position.y = -staticBackground.height / 2;
    fogOfWar.addChild(staticBackground);
    fogOfWar.sortableChildren = true;
    fogOfWar.filters = [new PIXI.filters.AlphaFilter(dark)];

    scene.addChild(fogOfWar);
    scene.addChild(visible);
    scene.visible = visible;

    this.sceneSize = { width: scene.width, height: scene.height };
    this.grid = generateGrid({ width: scene.width, height: scene.height }, 50);

    this.camera = new Camera({ renderer, scene, level: this });

    this.scene = scene;
    this.visible = visible;
    this.fogOfWar = fogOfWar;

    this.addChild = this.addChild.bind(this);
    this.getObstacles = this.getObstacles.bind(this);
    this.removeChild = this.removeChild.bind(this);
    this.setMask = this.setMask.bind(this);
    this.removeMask = this.removeMask.bind(this);
    this.setEffect = this.setEffect.bind(this);
    this.animate = this.animate.bind(this);
    this.destroy = this.destroy.bind(this);
    this.update = this.update.bind(this);

    this.debug = 0;
  }

  addChild(entity: PIXI.Container, fogOfWarEntity?: PIXI.Container) {
    this.visible.addChild(entity);
    if (fogOfWarEntity) {
      this.fogOfWar.addChild(fogOfWarEntity);
    }

    if (entity.getCollisionBox) {
      const { square, x, y } = pointToSquare(
        { x: entity.position.x, y: entity.position.y },
        this.grid,
        this.sceneSize,
      );
      square.push(entity);
    }
  }

  getObstacles(point, range) {
    if (!point.x) return [];
    for (let e of this.visible.children) {
      if (e.showDebug) {
        e.showDebug(false);
      }
    }
    const p1 = { x: point.x - range, y: point.y - range };
    const p2 = { x: point.x + range, y: point.y - range };
    const p3 = { x: point.x + range, y: point.y + range };
    const p4 = { x: point.x - range, y: point.y + range };
    const s1 = pointToSquare(p1, this.grid, this.sceneSize);
    const s2 = pointToSquare(p2, this.grid, this.sceneSize);
    const s3 = pointToSquare(p3, this.grid, this.sceneSize);
    const s4 = pointToSquare(p4, this.grid, this.sceneSize);

    const result = includeAdjecentSquares({ s1, s2, s3, s4 }, this.grid);

    //const result = new Set(s1.square.concat(s2.square, s3.square, s4.square));

    this.debug++;
    if (this.debug === 200) {
      console.log('****DEBUG IN LEVEL ***');
      console.log({ s1, s2, s3, s4 });
      console.log(result);
    }

    //result.forEach((e) => e && e.showDebug && e.showDebug(true));

    return Array.from(result);
  }

  removeChild(container) {
    this.visible.removeChild(container);
    this.fogOfWar.removeChild(container);
  }

  setMask(key, newMask) {
    if (this.visibleMasks[key]) {
      this.visible.mask.removeChild(this.visibleMasks[key]);
      this.visibleMasks[key].destroy();
    }
    this.visible.mask.addChild(newMask);
    this.visibleMasks[key] = newMask;
  }

  removeMask(key) {
    this.visible.mask.removeChild(this.visibleMasks[key]);
    this.visibleMasks[key].destroy();
    delete this.visibleMasks[key];
  }
  setEffect(effect) {
    this.effects.push(effect);
  }

  destroy() {
    this.scene.destroy({ children: true });
  }
  update(delta, player) {
    this.camera.updateCamera(player.position);
    const fov = this.camera.generateFieldOfView(
      player.position,
      player.sightRange,
      true,
    );
    this.setMask('fieldOfView', fov);
    this.animate(delta);
  }
  animate(delta) {
    for (let effect of this.effects) {
      effect.animate(delta);
    }
  }
}

export default Level;
