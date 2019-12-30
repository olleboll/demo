import React, { useState, useEffect } from 'react';
import './App.css';

import { createPixiApp } from './engine';

import { arrayOfAll } from './game/sprites';
import Stats from './stats';

import Game from './game/game';

const SCALE = 1.1;

function App() {
  const [app, setApp] = useState();

  //initialize
  useEffect(() => {
    async function initGame() {
      if (!app) {
        const container = document.getElementById('game');

        container.style.width = `${100 / (SCALE + 0.2)}%`;
        container.style.height = `${90 / (SCALE + 0.2)}%`;

        container.style.maxWidth = `${1400 / (SCALE + 0.2)}px`;
        container.style.maxHeight = `${1200 / (SCALE + 0.2)}px`;

        const { app: pixiApp } = await createPixiApp({
          div: 'game',
          width: container.offsetWidth,
          height: container.offsetHeight,
          spritesheets: arrayOfAll,
        });
        const s = Game(pixiApp, SCALE);
        pixiApp.stage.addChild(s.stage);
        s.init();

        //pixiApp.view.style.zoom = SCALE;
        pixiApp.view.style.MozTransform = `scale(${SCALE})`;
        pixiApp.view.style.WebkitTransform = `scale(${SCALE})`;

        pixiApp.ticker.add(s.update);
        setApp(pixiApp);
      }
    }

    initGame();
  }, [app]);

  // cleanup
  useEffect(
    () => () => {
      if (app) {
        app.destroy();
      }
    },
    [app],
  );

  return (
    <>
      <div id="container" className="container">
        <div className="top">
          <Stats />
          <div>
            <h4 className="instructions">
              R: swap universe <br />
              E: interact with the pink tree when close <br />
              Mouse1: Arrows, Hold for more effect on ememies <br />
              Space: Dash
            </h4>
          </div>
        </div>
        <div id="game"></div>
      </div>
    </>
  );
}

export default App;
