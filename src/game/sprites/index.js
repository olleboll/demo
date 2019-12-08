import characters from './characters';
import maps from './maps';
import objects from './objects';
import weapons from './weapons';
import effects from './effects';

const arrayOfAll = [
  ...characters.source,
  ...maps.source,
  ...objects.source,
  ...weapons.source,
  ...effects.source,
];

export { characters, maps, objects, arrayOfAll };
