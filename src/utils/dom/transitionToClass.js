import shadowClosest from './shadowClosest.js';

export default function transitionToClass(element, className = 'on') {
  const transition = shadowClosest(element, 'tpin-presentation').transition;

  if (!transition) {
    element.classList.add(className);
    return Promise.resolve();
  }

  element.classList.add(`${className}-transition`);
  element.offsetWidth; // force layout
  element.classList.add(className);
  element.offsetWidth; // force layout

  return Promise.all(
    element.getAnimations().map(
      // web animations use rejections to signify animation abort :(
      a => a.finished.then(() => true).catch(() => false)
    )
  ).then(() => {
    element.classList.remove(`${className}-transition`);
  });
}
