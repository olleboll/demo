import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

import PIXI, { createPixiApp } from './engine';

import { characters } from './game/sprites';

import Game from './game/game';

function App() {
  const [app, setApp] = useState();

  //initialize
  useEffect(() => {
    async function initGame() {
      if (!app) {
        const { app: pixiApp, animate } = await createPixiApp({
          div: 'game',
          spritesheets: characters.source,
        });
        const s = Game(pixiApp);
        pixiApp.stage.addChild(s.stage);
        s.init();
        pixiApp.ticker.add(s.animate);

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
    <div className="App">
      <div id="game"></div>
    </div>
  );
}

export default App;
