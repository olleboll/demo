import React, { useState, useEffect } from 'react';
import './App.css';

import { createPixiApp } from './engine';

import { characters, maps } from './game/sprites';

import Game from './game/game';

function App() {
  const [app, setApp] = useState();

  //initialize
  useEffect(() => {
    async function initGame() {
      if (!app) {
        const container = document.getElementById('container');
        console.log(container.offsetWidth);
        const { app: pixiApp } = await createPixiApp({
          div: 'game',
          width: container.offsetWidth,
          height: container.offsetHeight,
          spritesheets: [...characters.source, ...maps.source],
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
    <div id="container" className="container">
      <div id="game"></div>
    </div>
  );
}

export default App;
