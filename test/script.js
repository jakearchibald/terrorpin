import Presentation from "../build/presentation";
import "../build/components/heading";

const presentation = new Presentation();
presentation.setAttribute('width', 1920);
presentation.setAttribute('height', 1080);
const notes = presentation.notes;

presentation.addSlide("Slide name", async function(slide) {
  console.log('one');
  notes.set(`
    This sort of thing works well for me
    Loads easier than adding multiple array items
    But we should support that too
  `);
  notes.startTimer();

  await slide.addState('State name');
  console.log('two');
  notes.set(`
    Here are some more notes
    All about my talk
  `);
  slide.add('<tpin-h>Hello</tpin-h>');

  await slide.addState('Another state name');
  console.log('three');
  slide.add('<tpin-h>World</tpin-h>');
});

presentation.addSlide("Slide2 name", async function(slide) {
  console.log('one');
  await slide.addState('State name');
  console.log('two');
  await slide.addState('Another state name');
  console.log('three');
});

document.body.appendChild(presentation);
