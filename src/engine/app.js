// @flow
import * as PIXI from 'pixi.js';

type PixiApp = {
  app: PIXI.App,
  animate: () => void,
  destroy: () => void,
};
type Resource = {
  src: string,
  key: string,
};
type PixiAppOptions = {
  div: string,
  spritesheets: Array<Resource>,
  width?: number,
  height?: number,
};

export const createPixiApp = (opts: PixiAppOptions): Promise<PixiApp> =>
  new Promise(async (resolve, reject) => {
    try {
      const {
        width = window.innerWidth,
        height = window.innerHeight,
        div,
        spritesheets,
      } = opts;

      const app = new PIXI.Application({
        width,
        height,
      });
      const sceneContainer = document.getElementById(div);
      if (sceneContainer !== null) {
        sceneContainer.appendChild(app.view);
      } else {
        return reject(`div ${div} cannot be found`);
      }

      const animate = () => {
        app.renderer.render(app.stage);
      };

      const destroy = () => {
        app.destroy({ children: true });
      };

      await loadSpriteSheets(spritesheets);

      app.ticker.add(animate);

      return resolve({
        app,
        animate,
        destroy,
      });
    } catch (err) {
      return reject(err);
    }
  });

const loadSpriteSheets = (spritesheets: Array<Resource>): any =>
  new Promise((resolve, reject) => {
    try {
      const loaded = {};

      // Add to loader
      spritesheets.forEach((r) => {
        PIXI.Loader.shared.add(r.key, r.src);
      });

      // load and resolve
      PIXI.Loader.shared.load(() => {
        return resolve(PIXI.Loader.shared.resources);
      });
    } catch (err) {
      return reject(err);
    }
  });

export const getResource = (key: string, opt: string) => {
  const r = PIXI.Loader.shared.resources[key];
  if (!opt) {
    return r;
  }
  return PIXI.Loader.shared.resources[key][opt];
};
