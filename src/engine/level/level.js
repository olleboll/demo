// @flow
//import { AlphaFilter } from 'pixi-filters';

import PIXI, { getResource } from 'engine';

import Camera from 'engine/camera';
import { getLinesOfRect } from 'engine/utils';

import {
  calculateFieldOfView,
  adjustCenterToViewport,
  checkCollision,
} from 'engine/utils';

import { generateGrid, pointToSquare, includeAdjecentSquares } from './utils';

class Level {
  constructor({
    name,
    renderer,
    dark,
    light,
    hasCamera = false,
    spriteKey,
    sceneWidth,
    sceneHeight,
  }) {
    // bind funcitons
    this.addVisibleFilter = this.addVisibleFilter.bind(this);
    this.addFogFilter = this.addFogFilter.bind(this);
    this.removeVisibleFilter = this.removeVisibleFilter.bind(this);
    this.removeFogFilter = this.removeFogFilter.bind(this);
    this.addChild = this.addChild.bind(this);
    this.getObstacles = this.getObstacles.bind(this);
    this.removeChild = this.removeChild.bind(this);
    this.setMask = this.setMask.bind(this);
    this.removeMask = this.removeMask.bind(this);
    this.setEffect = this.setEffect.bind(this);
    this.animate = this.animate.bind(this);
    this.destroy = this.destroy.bind(this);
    this.cull = this.cull.bind(this);
    this.update = this.update.bind(this);
    this.updateFov = this.updateFov.bind(this);
    this.updateGrid = this.updateGrid.bind(this);
    this.moveObjectInGrid = this.moveObjectInGrid.bind(this);
    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);

    // setup
    this.name = name;
    this.sceneWidth = sceneWidth;
    this.sceneHeight = sceneHeight;
    const scene = new PIXI.Container();
    const visible = new PIXI.Container();
    const fogOfWar = new PIXI.Container();
    this.scene = scene;
    this.visible = visible;
    this.fogOfWar = fogOfWar;
    this.visibleMask = new PIXI.Container();
    this.effects = [];

    const { map } = getResource(spriteKey).textures;

    const background = new PIXI.Sprite(map);
    background.zIndex = -background.height / 2;
    background.name = 'backgroundImage';
    background.position.x = -background.width / 2;
    background.position.y = -background.height / 2;
    this.background = background;
    visible.addChild(background);
    visible.sortableChildren = true;
    this.light = light;
    const visibleAlphaFilter = new PIXI.filters.AlphaFilter(light);
    visible.filters = [];
    this.addVisibleFilter('_alpha', visibleAlphaFilter);

    visible.mask = this.visibleMask;
    this.visibleMasks = {};
    this.visibleObjects = [];
    this.allObjects = [];

    const staticBackground = new PIXI.Sprite(map);
    staticBackground.zIndex = -staticBackground / 2;
    staticBackground.name = 'backgroundImage';
    staticBackground.position.x = -staticBackground.width / 2;
    staticBackground.position.y = -staticBackground.height / 2;
    fogOfWar.addChild(staticBackground);
    fogOfWar.sortableChildren = true;
    const fogAlphaFilter = new PIXI.filters.AlphaFilter(dark);
    fogOfWar.filters = [];
    this.addFogFilter('_alpha', fogAlphaFilter);

    scene.addChild(fogOfWar);
    scene.addChild(visible);
    scene.visible = visible;

    this.sceneSize = {
      width: this.sceneWidth,
      height: this.sceneHeight,
    };

    this.grid = generateGrid(this.sceneSize, 100);

    this.camera = new Camera({
      renderer,
      scene,
      level: this,
      sceneSize: this.sceneSize,
    });

    this.ambience = undefined;
  }

  addVisibleFilter(key, filter) {
    filter.key = key;
    this.visible.filters.push(filter);
  }

  removeVisibleFilter(key) {
    const i = this.visible.filters.findIndex((f) => f.key === key);
    this.visible.filters.splice(i, 1);
  }

  addFogFilter(key, filter) {
    filter.key = key;
    this.fogOfWar.filters.push(filter);
  }
  removeFogFilter(key) {
    const i = this.fogOfWar.filters.findIndex((f) => f.key === key);
    this.fogOfWar.filters.splice(i, 1);
  }

  addChild(entity: PIXI.Container, fogOfWarEntity?: PIXI.Container) {
    const iO = this.allObjects.findIndex((c) => c === entity);

    if (!entity) return;

    if (iO === -1) {
      this.allObjects.push(entity);
    }
    const iV = this.visibleObjects.findIndex((c) => c === entity);
    if (entity.noCull && iV === -1) {
      this.visibleObjects.push(entity);
      this.visible.addChild(entity);
    }

    if (entity) {
      const { square, x, y } = pointToSquare(
        { x: entity.position.x, y: entity.position.y },
        this.grid,
        this.sceneSize,
      );
      square.push(entity);
    }
  }

  removeChild(child) {
    console.log(child);
    const iO = this.allObjects.findIndex((c) => c === child);
    console.log(iO);
    if (iO > -1) {
      this.allObjects.splice(iO, 1);
      let test = this.allObjects.findIndex((c) => c === child);
      console.log(test);
    }

    const iV = this.visibleObjects.findIndex((c) => c === child);
    console.log(iV);
    if (iV > -1) {
      this.visibleObjects.splice(iV, 1);
    }
    this.visible.removeChild(child);
    this.updateGrid();
  }

  getObstacles(point, range) {
    if (!point.x) return [];
    const p1 = { x: point.x - range, y: point.y - range };
    const p2 = { x: point.x + range, y: point.y - range };
    const p3 = { x: point.x + range, y: point.y + range };
    const p4 = { x: point.x - range, y: point.y + range };
    const s1 = pointToSquare(p1, this.grid, this.sceneSize);
    const s2 = pointToSquare(p2, this.grid, this.sceneSize);
    const s3 = pointToSquare(p3, this.grid, this.sceneSize);
    const s4 = pointToSquare(p4, this.grid, this.sceneSize);

    const result = includeAdjecentSquares({ s1, s2, s3, s4 }, this.grid);

    return Array.from(result);
  }

  setMask(key, newMask) {
    if (this.visibleMasks[key]) {
      this.visibleMask.removeChild(this.visibleMasks[key]);
      this.visibleMasks[key].destroy();
    }
    this.visibleMask.addChild(newMask);
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

  cull(centerPoint) {
    this.visibleObjects.forEach((o) => {
      if (o.noCull) return;
      this.visible.removeChild(o);
    });
    this.visibleObjects = this.getObstacles(centerPoint, 500);
    // .filter(
    //   (o) => o.transform,
    // );
    this.visibleObjects.forEach((o) => {
      this.visible.addChild(o);
    });
  }

  update(delta, player) {
    this.camera.updateCamera(player.position);
    this.updateFov(player);
    //this.updateGrid();
    this.cull(player.position);
    this.animate(delta);
  }

  moveObjectInGrid(entity, oldPos) {
    const { square: oldSquare } = pointToSquare(
      { x: oldPos.x, y: oldPos.y },
      this.grid,
      this.sceneSize,
    );

    const oldI = oldSquare.findIndex((e) => e === entity);
    if (oldI > -1) {
      oldSquare.splice(oldI, 1);
    }

    const { square } = pointToSquare(
      { x: entity.position.x, y: entity.position.y },
      this.grid,
      this.sceneSize,
    );

    square.push(entity);
  }

  updateGrid() {
    this.grid = generateGrid(this.sceneSize, 100);

    for (let entity of this.allObjects) {
      const { square, x, y } = pointToSquare(
        { x: entity.position.x, y: entity.position.y },
        this.grid,
        this.sceneSize,
      );
      square.push(entity);
    }
  }

  updateFov(player) {
    const fov = this.camera.generateFieldOfView(
      player.position,
      player.sightRange,
      true,
    );
    this.setMask('fieldOfView', fov);
  }
  animate(delta) {
    for (let effect of this.effects) {
      effect.animate(delta);
    }
  }
  onEnter() {
    if (!this.ambience) return;
    this.ambienceId = this.ambience.play();
    this.ambience.fade(0, 1, 1000, this.ambienceId);
  }

  onLeave() {
    if (!this.ambience) return;
    this.ambience.fade(1, 0, 1000, this.ambienceId);
    this.ambience.once('fade', () => this.ambience.pause(this.ambienceId));
  }
}

export default Level;
