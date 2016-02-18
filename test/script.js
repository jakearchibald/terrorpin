import Presentation from "../build/presentation";

const presentation = new Presentation();

presentation.addSlide("Slide name", async function(slide) {
  console.log('one');
  await slide.addState('State name');
  console.log('two');
  await slide.addState('Another state name');
  console.log('three');
});

document.body.appendChild(presentation);
