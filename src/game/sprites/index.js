import characters from './characters';
import maps from './maps';
import objects from './objects';
import weapons from './weapons';

const arrayOfAll = [
  ...characters.source,
  ...maps.source,
  ...objects.source,
  ...weapons.source,
];

export { characters, maps, objects, arrayOfAll };
