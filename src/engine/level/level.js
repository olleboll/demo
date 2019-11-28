// @flow
//import { AlphaFilter } from 'pixi-filters';

import PIXI, { getResource } from 'engine';

import { createCamera } from 'engine/camera';
import type { Entity } from 'engine/objects';
import type { Point } from 'engine/utils';

import {
  calculateFieldOfView,
  adjustCenterToViewport,
  checkCollision,
} from 'engine/utils';

class Level {
  constructor({
    name,
    renderer,
    dark,
    light,
    hasCamera = false,
    backgroundSprite = 'map',
  }) {
    this.name = name;
    const scene = new PIXI.Container();
    const visible = new PIXI.Container();
    const fogOfWar = new PIXI.Container();
    const mask = new PIXI.Container();
    this.effects = [];

    const { textures } = getResource('map');

    const background = new PIXI.Sprite(textures[backgroundSprite]);
    background.zIndex = -background.height / 2;
    background.name = 'backgroundImage';
    background.position.x = -background.width / 2;
    background.position.y = -background.height / 2;
    visible.addChild(background);
    visible.sortableChildren = true;
    visible.filters = [new PIXI.filters.AlphaFilter(light)];
    visible.mask = mask;
    this.visibleMasks = {};

    const staticBackground = new PIXI.Sprite(textures[backgroundSprite]);
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

    this.camera = createCamera({ renderer, scene });

    this.scene = scene;
    this.visible = visible;
    this.fogOfWar = fogOfWar;

    this.addChild = this.addChild.bind(this);
    this.removeChild = this.removeChild.bind(this);
    this.setMask = this.setMask.bind(this);
    this.removeMask = this.removeMask.bind(this);
    this.setEffect = this.setEffect.bind(this);
    this.animate = this.animate.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  addChild(entity: PIXI.Container, fogOfWarEntity?: PIXI.Container) {
    this.visible.addChild(entity);
    if (fogOfWarEntity) {
      this.fogOfWar.addChild(fogOfWarEntity);
    }
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
  animate(delta) {
    for (let effect of this.effects) {
      effect.animate(delta);
    }
  }
  destroy() {
    this.scene.destroy({ children: true });
  }
}

export default Level;
