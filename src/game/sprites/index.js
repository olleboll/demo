import characters from './characters';
import maps from './maps';
import objects from './objects';
import weapons from './weapons';
import effects from './effects';
import animals from './animals';
import settlements from './settlements';

const arrayOfAll = [
  ...characters.source,
  ...maps.source,
  ...objects.source,
  ...weapons.source,
  ...effects.source,
  ...animals.source,
  ...settlements.source,
];

export { characters, maps, objects, animals, arrayOfAll };
